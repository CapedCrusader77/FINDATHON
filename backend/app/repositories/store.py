import logging
from collections import defaultdict
from threading import RLock
from typing import Any, Dict, List, Optional
from ..config import Settings

logger = logging.getLogger(__name__)

class MongoStore:
    """MongoDB Persistent Repository for DedupeIQ."""
    def __init__(self, uri: str, db_name: str = 'dedupeiq'):
        from pymongo import MongoClient
        from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

        self.uri = uri
        self.db_name = db_name
        self.lock = RLock()
        
        # Test connection with 4s timeout
        self.client = MongoClient(uri, serverSelectionTimeoutMS=4000)
        self.client.admin.command('ping')
        self.db = self.client[db_name]
        
        # Setup Collections
        self.col_scans = self.db['scans']
        self.col_files = self.db['files']
        self.col_groups = self.db['duplicate_groups']
        self.col_quarantine = self.db['quarantine']
        self.col_actions = self.db['audit_actions']
        self.col_settings = self.db['settings']
        
        # Ensure Indexes
        self.col_files.create_index('scan_id')
        self.col_files.create_index('sha256')
        self.col_groups.create_index('scan_id')
        
        logger.info(f"Connected to MongoDB Atlas: database '{db_name}'")

    @property
    def scans(self) -> Dict[str, Any]:
        return {doc['id']: {k: v for k, v in doc.items() if k != '_id'} for doc in self.col_scans.find()}

    @property
    def files(self) -> Dict[str, Any]:
        return {doc['id']: {k: v for k, v in doc.items() if k != '_id'} for doc in self.col_files.find()}

    @property
    def groups(self) -> Dict[str, Any]:
        return {doc['id']: {k: v for k, v in doc.items() if k != '_id'} for doc in self.col_groups.find()}

    @property
    def quarantine(self) -> Dict[str, Any]:
        return {doc['id']: {k: v for k, v in doc.items() if k != '_id'} for doc in self.col_quarantine.find()}

    @property
    def actions(self) -> List[Any]:
        return [{k: v for k, v in doc.items() if k != '_id'} for doc in self.col_actions.find()]

    @property
    def settings(self) -> Dict[str, Any]:
        doc = self.col_settings.find_one({'_id': 'app_settings'})
        if not doc:
            default_settings = {'image_threshold': .85, 'document_threshold': .80, 'semantic_threshold': .78}
            self.col_settings.update_one({'_id': 'app_settings'}, {'$set': default_settings}, upsert=True)
            return default_settings
        return {k: v for k, v in doc.items() if k != '_id'}

    def save_scan(self, scan_data: Dict[str, Any]):
        self.col_scans.update_one({'id': scan_data['id']}, {'$set': scan_data}, upsert=True)

    def save_file(self, file_data: Dict[str, Any]):
        self.col_files.update_one({'id': file_data['id']}, {'$set': file_data}, upsert=True)

    def save_group(self, group_data: Dict[str, Any]):
        self.col_groups.update_one({'id': group_data['id']}, {'$set': group_data}, upsert=True)

    def save_quarantine(self, quarantine_data: Dict[str, Any]):
        self.col_quarantine.update_one({'id': quarantine_data['id']}, {'$set': quarantine_data}, upsert=True)

    def delete_quarantined(self, file_id: str):
        self.col_quarantine.delete_one({'id': file_id})

    def log_action(self, action_data: Dict[str, Any]):
        self.col_actions.insert_one(action_data)

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
                'isDemo': len(files) == 0,
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
            logger.warning(f"Could not connect to MongoDB ({err}). Falling back to MemoryStore.")
    return MemoryStore()

store = init_store()
