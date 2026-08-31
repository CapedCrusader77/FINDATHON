import threading
import uuid
from pathlib import Path
from flask import Blueprint, jsonify, request
from ..repositories.store import store
from ..services.scanner import discover, group_records
from ..services.quarantine import move_to_quarantine, permanently_delete, restore_from_quarantine

api = Blueprint('api', __name__); progress_state = {}
@api.get('/dashboard')
def dashboard(): return jsonify(store.dashboard())
@api.get('/duplicate-groups')
def groups(): return jsonify(list(store.groups.values()))
@api.get('/duplicate-groups/<group_id>')
def group(group_id):
    item = store.groups.get(group_id); return jsonify(item) if item else (jsonify({'error': 'Group not found'}), 404)
@api.get('/history')
def history(): return jsonify(list(store.scans.values()))
@api.post('/scans')
def start_scan():
    body = request.get_json(silent=True) or {}; root = body.get('root_path'); scan_id = str(uuid.uuid4()); upload_dir = Path('.dedupeiq') / 'uploads' / scan_id
    if request.files:
        upload_dir.mkdir(parents=True, exist_ok=True)
        for uploaded in request.files.getlist('files'):
            relative = Path(uploaded.filename or 'unnamed').name
            target = (upload_dir / relative).resolve()
            if upload_dir.resolve() not in target.parents: return jsonify({'error': 'Unsafe filename'}), 400
            uploaded.save(target)
        root = str(upload_dir)
    store.scans[scan_id] = {'id': scan_id, 'name': body.get('name') or Path(root or 'Selected folder').name, 'files': 0, 'size': 0, 'groups': 0, 'recovered': 0, 'status': 'Running', 'date': __import__('datetime').datetime.now().isoformat()}; progress_state[scan_id] = {'phase': 'queued', 'processed': 0, 'total': 0, 'current_file': None}
    if not root: store.scans[scan_id]['status'] = 'Completed'; return jsonify({'id': scan_id, 'status': 'completed'}), 202
    root_path = Path(root).resolve()
    if not root_path.exists() or not root_path.is_dir(): return jsonify({'error': 'A valid server-side folder is required'}), 400
    def run():
        progress_state[scan_id] = {'phase': 'discovering', 'processed': 0, 'total': 0, 'current_file': None}; records = discover(root_path, scan_id, lambda state: progress_state.update({scan_id: state})); found = group_records(records, scan_id, lambda state: progress_state.update({scan_id: state})); store.scans[scan_id].update({'files': len(records), 'size': sum(r['size'] for r in records), 'groups': len(found), 'status': 'Completed'}); progress_state[scan_id] = {'phase': 'complete', 'processed': len(records), 'total': len(records), 'current_file': None}
    threading.Thread(target=run, daemon=True).start(); return jsonify({'id': scan_id, 'status': 'running'}), 202
@api.get('/scans/<scan_id>/progress')
def scan_progress(scan_id): return jsonify(progress_state.get(scan_id, {'phase': 'unknown', 'processed': 0, 'total': 0}))
@api.post('/files/<file_id>/quarantine')
def quarantine(file_id):
    try: result = move_to_quarantine(file_id)
    except FileNotFoundError as error: return jsonify({'error': str(error)}), 404
    except (PermissionError, OSError) as error: return jsonify({'error': str(error)}), 409
    store.actions.append({'type': 'quarantine', 'file_id': file_id}); return jsonify(result)
@api.post('/files/<file_id>/restore')
def restore(file_id):
    try: result = restore_from_quarantine(file_id)
    except FileNotFoundError as error: return jsonify({'error': str(error)}), 404
    except (FileExistsError, OSError) as error: return jsonify({'error': str(error)}), 409
    store.actions.append({'type': 'restore', 'file_id': file_id}); return jsonify(result)
@api.get('/quarantine')
def get_quarantine(): return jsonify(list(store.quarantine.values()))
@api.delete('/quarantine/<file_id>')
def delete_quarantined(file_id):
    try: permanently_delete(file_id)
    except FileNotFoundError as error: return jsonify({'error': str(error)}), 404
    store.actions.append({'type': 'permanent_delete', 'file_id': file_id}); return jsonify({'status': 'deleted', 'id': file_id})
@api.get('/settings')
def get_settings(): return jsonify(store.settings)
@api.put('/settings')
def put_settings(): store.settings.update(request.get_json(silent=True) or {}); return jsonify(store.settings)
