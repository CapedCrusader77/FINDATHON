import math
import mimetypes
import uuid
from pathlib import Path
from .extractors import category_for, extract_text, image_metadata
from .hashing import sha256_file
from .similarity import document_similarity, image_similarity
from ..repositories.store import store

def discover(root: Path, scan_id: str, progress=None):
    paths = [p for p in root.rglob('*') if p.is_file() and not any(part.startswith('.') for part in p.relative_to(root).parts)]
    total = len(paths)
    records = []
    for index, path in enumerate(paths, 1):
        try:
            stat = path.stat(); category = category_for(path); record = {'id': str(uuid.uuid4()), 'name': path.name, 'path': str(path.resolve()), 'extension': path.suffix.lower().lstrip('.').upper(), 'mime_type': mimetypes.guess_type(path.name)[0] or 'application/octet-stream', 'category': category, 'size': stat.st_size, 'modified_at': str(stat.st_mtime), 'sha256': sha256_file(path), 'scan_id': scan_id, 'status': 'active'}
            if category == 'image': record.update(image_metadata(path))
            elif category == 'document':
                text = extract_text(path); record['text_fingerprint'] = {'text': text, 'word_count': len(text.split())}
            records.append(record); store.files[record['id']] = record
        except Exception as error:
            store.actions.append({'type': 'scan_error', 'scan_id': scan_id, 'path': str(path), 'error': type(error).__name__})
        if progress: progress({'phase': 'hashing', 'processed': index, 'total': total, 'current_file': path.name})
    return records

def group_records(records, scan_id: str, progress=None):
    by_hash = {}; groups = []
    for record in records:
        if record.get('sha256'): by_hash.setdefault(record['sha256'], []).append(record)
    candidates = [items for items in by_hash.values() if len(items) > 1]
    for items in candidates: groups.append(make_group(items, 'Exact', 1.0, scan_id))
    for category in ('image', 'document'):
        typed = [r for r in records if r['category'] == category]
        buckets = {}
        for record in typed:
            size_bucket = int(math.log2(max(record.get('size', 1), 1)))
            name_bucket = record.get('name', '').lower().replace('_', ' ')[:4]
            buckets.setdefault((size_bucket, name_bucket), []).append(record)
        candidate_pairs = set()
        for (size_bucket, name_bucket), items in buckets.items():
            nearby = items + [candidate for (key, values) in buckets.items() if key[1] == name_bucket and abs(key[0] - size_bucket) <= 1 for candidate in values]
            for index, left in enumerate(nearby):
                for right in nearby[index + 1:]:
                    pair = tuple(sorted((left['id'], right['id'])))
                    candidate_pairs.add(pair)
        for index, (left_id, right_id) in enumerate(candidate_pairs):
            left = store.files[left_id]; right = store.files[right_id]
            if left.get('sha256') == right.get('sha256'): continue
            result = image_similarity({**left, **left.get('perceptual_hashes', {})}, {**right, **right.get('perceptual_hashes', {})}) if category == 'image' else document_similarity({**left, **left.get('text_fingerprint', {})}, {**right, **right.get('text_fingerprint', {})})
            threshold = .85 if category == 'image' else .80
            if result['overall'] >= threshold: groups.append(make_group([left, right], 'Near image' if category == 'image' else 'Near document', result['overall'], scan_id, result))
            if progress: progress({'phase': 'grouping', 'processed': index + 1, 'total': len(candidate_pairs)})
    for group in groups: store.groups[group['id']] = group
    return groups

def make_group(files, group_type, score, scan_id, result=None):
    files = sorted(files, key=lambda f: (f.get('size', 0), f.get('modified_at', '')), reverse=True)
    files[0]['is_recommended'] = True
    return {'id': str(uuid.uuid4()), 'scan_id': scan_id, 'title': files[0]['name'].rsplit('.', 1)[0], 'type': group_type, 'files': files, 'similarity': round(score * 100), 'recoverable': sum(f.get('size', 0) for f in files[1:]), 'confidence': result.get('confidence', 'Exact duplicate') if result else 'Exact duplicate', 'signals': [{'label': key.replace('_', ' ').title(), 'score': round(value * 100)} for key, value in (result or {}).get('signals', {}).items()], 'explanation': 'Files share the same SHA-256 hash.' if group_type == 'Exact' else 'The candidate passed multiple independent similarity signals.'}
