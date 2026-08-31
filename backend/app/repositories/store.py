import logging
from collections import defaultdict
from threading import RLock
from typing import Any, Dict, List, Optional
from ..config import Settings

logger = logging.getLogger(__name__)

class MongoCollectionMap:
    """Dict-like proxy that maps key-value operations directly to a MongoDB collection."""
    def __init__(self, collection, id_field: str = 'id'):
        self.col = collection
        self.id_field = id_field

    def __getitem__(self, key: str) -> Dict[str, Any]:
        doc = self.col.find_one({self.id_field: key})
        if not doc:
            raise KeyError(key)
        return {k: v for k, v in doc.items() if k != '_id'}

    def __setitem__(self, key: str, value: Dict[str, Any]):
        data = dict(value)
        data[self.id_field] = key
        self.col.update_one({self.id_field: key}, {'$set': data}, upsert=True)

    def get(self, key: str, default: Any = None) -> Any:
        try:
            return self[key]
        except KeyError:
            return default

    def values(self):
        for doc in self.col.find():
            yield {k: v for k, v in doc.items() if k != '_id'}

    def items(self):
        for doc in self.col.find():
            yield doc.get(self.id_field), {k: v for k, v in doc.items() if k != '_id'}

    def __contains__(self, key: str) -> bool:
        return self.col.count_documents({self.id_field: key}) > 0

    def __len__(self) -> int:
        return self.col.count_documents({})

    def pop(self, key: str, default: Any = None) -> Any:
        doc = self.col.find_one_and_delete({self.id_field: key})
        if doc:
            return {k: v for k, v in doc.items() if k != '_id'}
        return default


class MongoActionList:
    """List-like proxy for audit actions collection."""
    def __init__(self, collection):
        self.col = collection

    def append(self, action_data: Dict[str, Any]):
        self.col.insert_one(dict(action_data))

    def __iter__(self):
        for doc in self.col.find():
            yield {k: v for k, v in doc.items() if k != '_id'}

    def __len__(self) -> int:
        return self.col.count_documents({})


class MongoStore:
    """MongoDB Persistent Repository for DedupeIQ."""
    def __init__(self, uri: str, db_name: str = 'dedupeiq'):
        from pymongo import MongoClient

        self.uri = uri
        self.db_name = db_name
        self.lock = RLock()
        
        # Test connection with 5s timeout
        self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        self.client.admin.command('ping')
        self.db = self.client[db_name]
        
        # Collections
        self.col_scans = self.db['scans']
        self.col_files = self.db['files']
        self.col_groups = self.db['duplicate_groups']
        self.col_quarantine = self.db['quarantine']
        self.col_actions = self.db['audit_actions']
        self.col_settings = self.db['settings']
        
        # Indexes for fast search
        self.col_files.create_index('scan_id')
        self.col_files.create_index('sha256')
        self.col_groups.create_index('scan_id')
        
        # Proxies
        self.scans = MongoCollectionMap(self.col_scans, 'id')
        self.files = MongoCollectionMap(self.col_files, 'id')
        self.groups = MongoCollectionMap(self.col_groups, 'id')
        self.quarantine = MongoCollectionMap(self.col_quarantine, 'id')
        self.actions = MongoActionList(self.col_actions)

        # Settings
        self._init_settings()
        logger.info(f"Connected to MongoDB Atlas: database '{db_name}'")

    def _init_settings(self):
        doc = self.col_settings.find_one({'_id': 'app_settings'})
        if not doc:
            default_settings = {'image_threshold': .85, 'document_threshold': .80, 'semantic_threshold': .78}
            self.col_settings.update_one({'_id': 'app_settings'}, {'$set': default_settings}, upsert=True)

    @property
    def settings(self) -> Dict[str, Any]:
        doc = self.col_settings.find_one({'_id': 'app_settings'})
        if not doc:
            return {'image_threshold': .85, 'document_threshold': .80, 'semantic_threshold': .78}
        return {k: v for k, v in doc.items() if k != '_id'}

    def dashboard(self) -> Dict[str, Any]:
        files = list(self.files.values())
        groups = list(self.groups.values())
        duplicate_ids = {f['id'] for g in groups for f in g.get('files', [])[1:] if 'id' in f}
        total = sum(f.get('size', 0) for f in files)
        recoverable = sum(g.get('recoverable', 0) for g in groups)

        by_type = defaultdict(int)
        for f in files:
            by_type[f.get('category', 'other')] += f.get('size', 0)

        storage = [
            {'name': k.title(), 'value': round(v / total * 100) if total else 0, 'color': c, 'bytes': v}
            for k, v, c in [('images', by_type['image'], '#6366f1'), ('documents', by_type['document'], '#a855f7'), ('other', by_type['other'], '#06b6d4')]
        ]

        recovery = defaultdict(int)
        for group in groups:
            files_list = group.get('files', [])
            category = files_list[0].get('category', 'other') if files_list else 'other'
            recovery[category] += group.get('recoverable', 0)

        recovery_by_type = [
            {'name': key.title(), 'value': round(value / 1024 ** 3, 2), 'bytes': value}
            for key, value in recovery.items()
        ]

        breakdown = defaultdict(int)
        for group in groups:
            breakdown[group.get('type', 'Other')] += 1

        duplicate_breakdown = [
            {'name': key, 'value': value, 'color': color}
            for key, value, color in [
                ('Exact', breakdown['Exact'], '#3b82f6'),
                ('Near image', breakdown['Near image'], '#6366f1'),
                ('Near document', breakdown['Near document'], '#a855f7'),
                ('Semantic', breakdown['Semantic match'], '#10b981')
            ]
        ]

        return {
            'isDemo': False,
            'filesScanned': len(files),
            'duplicateFiles': len(duplicate_ids),
            'duplicateGroups': len(groups),
            'recoverable': recoverable,
            'recovered': 0,
            'scannedSize': total,
            'storageBreakdown': storage,
            'duplicateBreakdown': duplicate_breakdown,
            'recoveryByType': recovery_by_type
        }

    def clear_scan(self, scan_id: str):
        self.col_files.delete_many({'scan_id': scan_id})
        self.col_groups.delete_many({'scan_id': scan_id})


class MemoryStore:
    """In-memory fallback store if MongoDB is not reachable."""
    def __init__(self):
        self.lock = RLock()
        self.scans = {}
        self.files = {}
        self.groups = {}
        self.quarantine = {}
        self.actions = []
        self.settings = {'image_threshold': .85, 'document_threshold': .80, 'semantic_threshold': .78}

    def dashboard(self):
        with self.lock:
            files = list(self.files.values())
            groups = list(self.groups.values())
            duplicate_ids = {f['id'] for g in groups for f in g.get('files', [])[1:] if 'id' in f}
            total = sum(f.get('size', 0) for f in files)
            recoverable = sum(g.get('recoverable', 0) for g in groups)
            by_type = defaultdict(int)
            for f in files:
                by_type[f.get('category', 'other')] += f.get('size', 0)
            storage = [
                {'name': k.title(), 'value': round(v / total * 100) if total else 0, 'color': c, 'bytes': v}
                for k, v, c in [('images', by_type['image'], '#6366f1'), ('documents', by_type['document'], '#a855f7'), ('other', by_type['other'], '#06b6d4')]
            ]
            recovery = defaultdict(int)
            for group in groups:
                files_list = group.get('files', [])
                category = files_list[0].get('category', 'other') if files_list else 'other'
                recovery[category] += group.get('recoverable', 0)
            recovery_by_type = [{'name': key.title(), 'value': round(value / 1024 ** 3, 2), 'bytes': value} for key, value in recovery.items()]
            breakdown = defaultdict(int)
            for group in groups:
                breakdown[group.get('type', 'Other')] += 1
            duplicate_breakdown = [{'name': key, 'value': value, 'color': color} for key, value, color in [('Exact', breakdown['Exact'], '#3b82f6'), ('Near image', breakdown['Near image'], '#6366f1'), ('Near document', breakdown['Near document'], '#a855f7'), ('Semantic', breakdown['Semantic match'], '#10b981')]]
            return {
                'isDemo': False,
                'filesScanned': len(files),
                'duplicateFiles': len(duplicate_ids),
                'duplicateGroups': len(groups),
                'recoverable': recoverable,
                'recovered': 0,
                'scannedSize': total,
                'storageBreakdown': storage,
                'duplicateBreakdown': duplicate_breakdown,
                'recoveryByType': recovery_by_type
            }

    def clear_scan(self, scan_id):
        with self.lock:
            for key in [k for k, v in self.files.items() if v.get('scan_id') == scan_id]:
                self.files.pop(key, None)
            for key in [k for k, v in self.groups.items() if v.get('scan_id') == scan_id]:
                self.groups.pop(key, None)


def init_store():
    mongo_uri = Settings.MONGO_URI
    if mongo_uri:
        try:
            return MongoStore(mongo_uri, Settings.MONGO_DB)
        except Exception as err:
            logger.warning(f"Could not connect to MongoDB Atlas ({err}). Falling back to MemoryStore.")
    return MemoryStore()

store = init_store()
