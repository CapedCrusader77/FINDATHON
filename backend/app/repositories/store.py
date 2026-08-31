from collections import defaultdict
from threading import RLock

class MemoryStore:
    """Development fallback. Swap this repository for MongoStore without changing routes/services."""
    def __init__(self):
        self.lock = RLock(); self.scans = {}; self.files = {}; self.groups = {}; self.quarantine = {}; self.actions = []; self.settings = {'image_threshold': .85, 'document_threshold': .80, 'semantic_threshold': .78}
    def dashboard(self):
        with self.lock:
            files = list(self.files.values()); groups = list(self.groups.values())
            duplicate_ids = {f['id'] for g in groups for f in g['files'][1:]}
            total = sum(f.get('size', 0) for f in files)
            recoverable = sum(g.get('recoverable', 0) for g in groups)
            by_type = defaultdict(int)
            for f in files: by_type[f.get('category', 'other')] += f.get('size', 0)
            storage = [{'name': k.title(), 'value': round(v / total * 100) if total else 0, 'color': c} for k, v, c in [('images', by_type['image'], '#5c75e6'), ('documents', by_type['document'], '#7c9cf5'), ('other', by_type['other'], '#d7dce6')]]
            recovery = defaultdict(int)
            for group in groups:
                category = group.get('files', [{}])[0].get('category', 'other'); recovery[category] += group.get('recoverable', 0)
            recovery_by_type = [{'name': key.title(), 'value': round(value / 1024 ** 3, 2)} for key, value in recovery.items()]
            breakdown = defaultdict(int)
            for group in groups: breakdown[group.get('type', 'Other')] += 1
            duplicate_breakdown = [{'name': key, 'value': value, 'color': color} for key, value, color in [('Exact', breakdown['Exact'], '#4668e8'), ('Near image', breakdown['Near image'], '#7c9cf5'), ('Near document', breakdown['Near document'], '#a98be8'), ('Semantic', breakdown['Semantic match'], '#d6a85f')]]
            return {'filesScanned': len(files), 'duplicateFiles': len(duplicate_ids), 'duplicateGroups': len(groups), 'recoverable': recoverable, 'recovered': 0, 'scannedSize': total, 'storageBreakdown': storage, 'duplicateBreakdown': duplicate_breakdown, 'recoveryByType': recovery_by_type}
    def clear_scan(self, scan_id):
        with self.lock:
            for key in [k for k, v in self.files.items() if v.get('scan_id') == scan_id]: self.files.pop(key, None)
            for key in [k for k, v in self.groups.items() if v.get('scan_id') == scan_id]: self.groups.pop(key, None)

store = MemoryStore()
