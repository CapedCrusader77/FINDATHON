import math
import re
from collections import Counter
from difflib import SequenceMatcher

def tokens(text: str) -> list[str]: return re.findall(r'[\w]{2,}', text.lower())
def jaccard(a: str, b: str) -> float:
    aa, bb = set(tokens(a)), set(tokens(b)); return len(aa & bb) / len(aa | bb) if aa | bb else 0.0
def cosine(a: str, b: str) -> float:
    aa, bb = Counter(tokens(a)), Counter(tokens(b)); common = set(aa) & set(bb)
    dot = sum(aa[t] * bb[t] for t in common); norm = math.sqrt(sum(v*v for v in aa.values()) * sum(v*v for v in bb.values()))
    return dot / norm if norm else 0.0
def filename_similarity(a: str, b: str) -> float: return SequenceMatcher(None, a.rsplit('.', 1)[0].lower(), b.rsplit('.', 1)[0].lower()).ratio()
def phash_similarity(a: str, b: str) -> float:
    try:
        distance = (int(a, 16) ^ int(b, 16)).bit_count()
        return max(0.0, 1.0 - distance / 64)
    except (ValueError, TypeError): return 0.0
def confidence(score: float) -> str:
    return 'Exact duplicate' if score >= 0.999 else 'Almost certain' if score >= .95 else 'Highly similar' if score >= .85 else 'Possible duplicate'
def document_similarity(left: dict, right: dict) -> dict:
    a, b = left.get('text', ''), right.get('text', '')
    signals = {'semantic': cosine(a, b), 'text_overlap': jaccard(a, b), 'filename': filename_similarity(left['name'], right['name'])}
    score = .52 * signals['semantic'] + .30 * signals['text_overlap'] + .12 * signals['filename'] + .06 * (1 if left.get('pages') == right.get('pages') else .5)
    return {'overall': round(score, 4), 'signals': signals, 'confidence': confidence(score)}
def image_similarity(left: dict, right: dict) -> dict:
    hashes = [phash_similarity(left.get('perceptual_hashes', {}).get(k), right.get('perceptual_hashes', {}).get(k)) for k in ('phash', 'dhash', 'ahash')]
    signals = {'perceptual_hash': sum(hashes) / len(hashes), 'filename': filename_similarity(left['name'], right['name']), 'aspect_ratio': 1.0 if left.get('aspect_ratio') == right.get('aspect_ratio') else .65}
    score = .78 * signals['perceptual_hash'] + .14 * signals['aspect_ratio'] + .08 * signals['filename']
    return {'overall': round(score, 4), 'signals': signals, 'confidence': confidence(score)}
