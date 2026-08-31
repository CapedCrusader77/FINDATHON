from app.services.hashing import sha256_file

def test_sha256_is_stable(tmp_path):
    target = tmp_path / 'sample.txt'; target.write_text('dedupeiq')
    assert sha256_file(target) == sha256_file(target)
