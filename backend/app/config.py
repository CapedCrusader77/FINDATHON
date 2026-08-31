import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    # Load .env from backend/ or project root
    load_dotenv(Path(__file__).resolve().parent.parent / '.env')
    load_dotenv(Path(__file__).resolve().parent.parent.parent / '.env')
except ImportError:
    pass

class Settings:
    MONGO_URI = os.getenv('MONGO_URI', '')
    MONGO_DB = os.getenv('MONGO_DB', 'dedupeiq')
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', str(2 * 1024 * 1024 * 1024)))
    DATA_DIR = Path(os.getenv('DEDUPEIQ_DATA_DIR', '.dedupeiq'))
    IMAGE_THRESHOLD = float(os.getenv('IMAGE_THRESHOLD', '0.85'))
    DOCUMENT_THRESHOLD = float(os.getenv('DOCUMENT_THRESHOLD', '0.80'))

