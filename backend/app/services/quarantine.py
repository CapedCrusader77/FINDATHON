import shutil
from pathlib import Path
from ..repositories.store import store

def move_to_quarantine(file_id: str) -> dict:
    record = store.files.get(file_id)
    if not record: raise FileNotFoundError('File record not found')
    source = Path(record['path']).resolve()
    if not source.exists(): raise FileNotFoundError('Source file is no longer available')
    target_dir = Path('.dedupeiq') / 'quarantine'; target_dir.mkdir(parents=True, exist_ok=True)
    target = (target_dir / f'{file_id}_{source.name}').resolve()
    if target_dir.resolve() not in target.parents: raise PermissionError('Invalid quarantine target')
    shutil.move(str(source), str(target)); record['status'] = 'quarantined'; record['quarantine_path'] = str(target)
    store.quarantine[file_id] = {**record, 'original_path': str(source)}
    return store.quarantine[file_id]

def restore_from_quarantine(file_id: str) -> dict:
    record = store.quarantine.get(file_id)
    if not record: raise FileNotFoundError('Quarantine record not found')
    target = Path(record['original_path']).resolve(); source = Path(record['quarantine_path']).resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists(): raise FileExistsError('A file already exists at the original location')
    shutil.move(str(source), str(target)); record['path'] = str(target); record['status'] = 'active'; store.files[file_id].update(record); store.quarantine.pop(file_id, None)
    return store.files[file_id]

def permanently_delete(file_id: str) -> None:
    record = store.quarantine.get(file_id)
    if not record: raise FileNotFoundError('Quarantine record not found')
    source = Path(record['quarantine_path']).resolve()
    if source.exists(): source.unlink()
    store.quarantine.pop(file_id, None); store.files.pop(file_id, None)
