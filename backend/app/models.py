from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

def utc_now() -> str: return datetime.now(timezone.utc).isoformat()

@dataclass
class FileRecord:
    id: str; name: str; path: str; extension: str; mime_type: str; category: str; size: int
    modified_at: str; sha256: str | None = None; dimensions: str | None = None; pages: int | None = None
    perceptual_hashes: dict[str, str] = field(default_factory=dict); text_fingerprint: dict[str, Any] = field(default_factory=dict)
    scan_id: str | None = None; status: str = 'active'

@dataclass
class SimilarityResult:
    left_id: str; right_id: str; overall: float; confidence: str; signals: list[dict[str, Any]]; explanation: str
