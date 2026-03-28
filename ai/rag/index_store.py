import os
import pickle
import logging
import numpy as np

logger = logging.getLogger(__name__)

_INDEXES_DIR = os.path.join(os.path.dirname(__file__), "indexes")
os.makedirs(_INDEXES_DIR, exist_ok=True)

EMBEDDING_DIM = 384


def _paths(patient_id: str | int) -> tuple[str, str]:
    pid = str(patient_id)
    return (
        os.path.join(_INDEXES_DIR, f"{pid}.faiss"),
        os.path.join(_INDEXES_DIR, f"{pid}.pkl"),
    )


def patient_index_exists(patient_id: str | int) -> bool:
    """Check if the FAISS index files exist for a given patient."""
    faiss_path, pkl_path = _paths(patient_id)
    return os.path.exists(faiss_path) and os.path.exists(pkl_path)


def _load_raw(patient_id: str | int):
    """
    Load existing FAISS index + metadata list from disk.
    Returns (index, meta_list) or (None, []) if no index exists yet.
    """
    import faiss
    faiss_path, pkl_path = _paths(patient_id)

    if not os.path.exists(faiss_path) or not os.path.exists(pkl_path):
        return None, []

    try:
        index = faiss.read_index(faiss_path)
        with open(pkl_path, "rb") as f:
            meta_list = pickle.load(f)
        logger.info(f"Loaded index for patient {patient_id}: {index.ntotal} vectors.")
        return index, meta_list
    except Exception as e:
        logger.error(f"Failed to load index for patient {patient_id}: {e}")
        return None, []


def _save_raw(patient_id: str | int, index, meta_list: list):
    import faiss
    faiss_path, pkl_path = _paths(patient_id)
    faiss.write_index(index, faiss_path)
    with open(pkl_path, "wb") as f:
        pickle.dump(meta_list, f)
    logger.info(f"Saved index for patient {patient_id}: {index.ntotal} vectors.")


def update_patient_index(patient_id: str | int, new_chunks: list[str], new_metas: list[dict]):
    """
    Incrementally add new_chunks to the patient's FAISS index.
    Creates the index from scratch if it doesn't exist.
    This is an O(new_chunks) operation — existing vectors are untouched.

    Args:
        patient_id:  Patient DB ID (int or str).
        new_chunks:  List of text strings to embed and add.
        new_metas:   Parallel list of metadata dicts for each chunk.
    """
    if not new_chunks:
        logger.info(f"No new chunks for patient {patient_id} — skipping index update.")
        return

    from .embedder import embed_texts
    import faiss

    new_embeddings = embed_texts(new_chunks)  # shape (N, 384)

    index, meta_list = _load_raw(patient_id)
    if index is None:
        index = faiss.IndexFlatIP(EMBEDDING_DIM)
        logger.info(f"Created new FAISS index for patient {patient_id}.")

    for chunk_text, meta in zip(new_chunks, new_metas):
        meta["text"] = chunk_text

    index.add(new_embeddings)
    meta_list.extend(new_metas)

    _save_raw(patient_id, index, meta_list)


def rebuild_patient_index(patient_id: str | int, all_chunks: list[str], all_metas: list[dict]):
    """
    Full rebuild — replaces any existing index.
    Use this sparingly (e.g., when a document is deleted).
    """
    import faiss

    from .embedder import embed_texts

    faiss_path, pkl_path = _paths(patient_id)
    # Wipe existing
    for p in (faiss_path, pkl_path):
        if os.path.exists(p):
            os.remove(p)

    if not all_chunks:
        logger.info(f"No chunks to index for patient {patient_id} after rebuild.")
        return

    embeddings = embed_texts(all_chunks)
    index = faiss.IndexFlatIP(EMBEDDING_DIM)
    index.add(embeddings)

    for chunk_text, meta in zip(all_chunks, all_metas):
        meta["text"] = chunk_text

    _save_raw(patient_id, index, all_metas)


def search_index(patient_id: str | int, query_text: str, top_k: int = 5) -> list[dict]:
    """
    Retrieve top-k chunks most relevant to query_text.

    Returns:
        List of metadata dicts (each with a "text" key and a "score" key).
        Empty list if no index exists.
    """
    from .embedder import embed_query

    index, meta_list = _load_raw(patient_id)
    if index is None or index.ntotal == 0:
        logger.info(f"No index for patient {patient_id} — returning empty results.")
        return []

    query_vec = embed_query(query_text)
    k = min(top_k, index.ntotal)
    scores, indices = index.search(query_vec, k)

    results = []
    for score, idx in zip(scores[0], indices[0]):
        if idx < 0:
            continue
        meta = dict(meta_list[idx])  # shallow copy
        meta["score"] = float(score)
        results.append(meta)

    logger.info(f"Search for patient {patient_id}: retrieved {len(results)} chunks (top score={results[0]['score']:.3f} if results else 'N/A').")
    return results