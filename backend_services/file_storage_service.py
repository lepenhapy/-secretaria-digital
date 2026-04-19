import hashlib
import os
import uuid
from pathlib import Path


class FileStorageService:
    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, loja_id: int, original_name: str, content: bytes) -> dict:
        loja_dir = self.base_dir / str(loja_id)
        loja_dir.mkdir(parents=True, exist_ok=True)

        extension = Path(original_name).suffix.lower()
        internal_name = f"{uuid.uuid4().hex}{extension}"
        file_path = loja_dir / internal_name
        file_path.write_bytes(content)

        sha256 = hashlib.sha256(content).hexdigest()
        return {
            "path": str(file_path),
            "sha256": sha256,
            "size": len(content),
            "stored_name": internal_name,
            "extension": extension,
        }

    def read_file(self, path: str) -> bytes:
        return Path(path).read_bytes()

    def exists(self, path: str) -> bool:
        return Path(path).exists()
