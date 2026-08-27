import os
import chromadb
from chromadb.utils import embedding_functions

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "chroma_db")

chroma_client = chromadb.PersistentClient(path=DB_PATH)

embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

collection = chroma_client.get_or_create_collection(
    name="industrial_manuals",
    embedding_function=embedding_fn
)

def add_chunks_to_vectorstore(chunks: list):
    if not chunks:
        return 0

    ids = [c["id"] for c in chunks]
    documents = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]

    collection.upsert(
        ids=ids,
        documents=documents,
        metadatas=metadatas
    )

    return len(chunks)

def query_vectorstore(query_text: str, n_results: int = 3, filter_metadata: dict = None):
    """
    Queries ChromaDB with an optional metadata filter (e.g. {"format": "pdf"}).
    """
    query_kwargs = {
        "query_texts": [query_text],
        "n_results": n_results
    }
    
    if filter_metadata:
        query_kwargs["where"] = filter_metadata

    results = collection.query(**query_kwargs)
    
    formatted_results = []
    if results and "documents" in results and results["documents"]:
        documents = results["documents"][0]
        metadatas = results["metadatas"][0] if "metadatas" in results else [{} for _ in documents]
        distances = results["distances"][0] if "distances" in results else [0.0 for _ in documents]
        
        for doc, meta, dist in zip(documents, metadatas, distances):
            formatted_results.append({
                "text": doc,
                "metadata": meta,
                "relevance_score": float(dist)
            })
            
    return formatted_results