from app.services.similarity import confidence, cosine, jaccard

def test_exact_text_similarity():
    assert cosine('alpha beta gamma', 'alpha beta gamma') == 1
    assert jaccard('alpha beta', 'alpha beta gamma') == 2 / 3
def test_confidence_bands():
    assert confidence(1) == 'Exact duplicate'
    assert confidence(.93) == 'Highly similar'
