from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path

import yaml


def train_memory_index() -> None:
    root = Path(__file__).resolve().parents[1]
    metadata_path = root / "memory" / "vector_db" / "faiss" / "metadata.yaml"
    metadata: dict[str, object] = {}
    if metadata_path.exists():
        with metadata_path.open("r", encoding="utf-8") as f:
            metadata = yaml.safe_load(f) or {}
    metadata["last_trained_at"] = datetime.now(timezone.utc).isoformat()
    metadata["version"] = int(metadata.get("version", 0)) + 1
    with metadata_path.open("w", encoding="utf-8") as f:
        yaml.safe_dump(metadata, f, sort_keys=False)
    print(f"Updated FAISS metadata: {metadata_path}")


if __name__ == "__main__":
    train_memory_index()
