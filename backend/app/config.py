import os
from pathlib import Path

class Settings:
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
    MONGO_DB = os.getenv('MONGO_DB', 'dedupeiq')
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', str(2 * 1024 * 1024 * 1024)))
    DATA_DIR = Path(os.getenv('DEDUPEIQ_DATA_DIR', '.dedupeiq'))
    IMAGE_THRESHOLD = float(os.getenv('IMAGE_THRESHOLD', '0.85'))
    DOCUMENT_THRESHOLD = float(os.getenv('DOCUMENT_THRESHOLD', '0.80'))
