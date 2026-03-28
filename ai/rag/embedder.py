"""
embedder.py — Singleton sentence-transformer embedding wrapper.

Model: all-MiniLM-L6-v2
- 80 MB, runs 100% locally (no API key, no cost per query)
- 384-dim vectors, excellent retrieval quality on short medical texts
- Downloads once on first run (~30s), cached forever after
"""

import logging
import numpy as np

logger = logging.getLogger(__name__)

_model = None  # lazy singleton


def _get_model():
    global _model
    if _model is None:
        logger.info("Loading sentence-transformer model (all-MiniLM-L6-v2)…")
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Embedding model ready.")
    return _model


def embed_texts(texts: list[str]) -> np.ndarray:
    """
    Embed a list of strings into a (N, 384) float32 numpy array.

    Args:
        texts: List of strings to embed. Empty strings produce a zero-vector.

    Returns:
        np.ndarray of shape (len(texts), 384), dtype float32.
    """
    if not texts:
        return np.empty((0, 384), dtype="float32")

    model = _get_model()
    # normalize_embeddings=True → cosine similarity becomes dot product (FAISS-friendly)
    embeddings = model.encode(
        texts,
        batch_size=32,
        show_progress_bar=False,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )
    return embeddings.astype("float32")


def embed_query(text: str) -> np.ndarray:
    """
    Embed a single query string → shape (1, 384).
    """
    return embed_texts([text])
