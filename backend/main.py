import time
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Optional
from utils.parser import process_document
from utils.logger import log_requests_middleware, logger
from utils.telemetry import telemetry
from rag.vectorstore import add_chunks_to_vectorstore, query_vectorstore
from rag.generator import generate_rag_answer
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Industrial Maintenance AI Agent API")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3100", "http://127.0.0.1:3100"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom production logging middleware
app.middleware("http")(log_requests_middleware)

class QueryRequest(BaseModel):
    question: str
    file_format_filter: Optional[str] = None  # e.g., "pdf", "docx", or "markdown"

@app.get("/")
def read_root():
    logger.info("Health check endpoint accessed.")
    return {
        "status": "online",
        "message": "Industrial Maintenance AI Agent API is running with telemetry & production logging. Visit /docs for interactive documentation."
    }

@app.get("/health/metrics")
def get_system_metrics():
    """
    Returns real-time execution telemetry and fallback metrics for system auditing.
    """
    logger.info("Health metrics endpoint requested.")
    return {
        "status": "operational",
        "metrics": telemetry.get_metrics()
    }

@app.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    allowed_exts = (".pdf", ".docx", ".md")
    if not file.filename.endswith(allowed_exts):
        logger.warning(f"Ingestion rejected for unsupported extension: {file.filename}")
        raise HTTPException(status_code=400, detail="Unsupported format. Only PDF, DOCX, and MD files are supported.")

    try:
        contents = await file.read()
        chunks = process_document(contents, file.filename)
        total_indexed = add_chunks_to_vectorstore(chunks)
        
        logger.info(f"Successfully ingested and indexed {total_indexed} chunks from {file.filename}")
        return {
            "status": "success",
            "filename": file.filename,
            "total_chunks_indexed": total_indexed
        }
    except Exception as e:
        logger.error(f"Error during document ingestion for {file.filename}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query")
async def query_maintenance_agent(payload: QueryRequest):
    start_time = time.time()
    try:
        # Build optional metadata filter clause
        meta_filter = {"format": payload.file_format_filter} if payload.file_format_filter else None
        logger.info(f"Processing query: '{payload.question}' with filter: {meta_filter}")

        # 1. Retrieve relevant chunks with filtering applied
        retrieved_contexts = query_vectorstore(payload.question, n_results=3, filter_metadata=meta_filter)
        
        if not retrieved_contexts:
            logger.info("Query returned no matching documentation chunks.")
            duration_ms = (time.time() - start_time) * 1000
            telemetry.record_query(success=True, used_fallback=False, duration_ms=duration_ms)
            return {
                "status": "success",
                "question": payload.question,
                "answer": "No relevant technical documentation found matching the criteria.",
                "sources": []
            }

        # 2. Generate the synthesized answer using OpenAI / Ollama fallback
        synthesized_answer = generate_rag_answer(payload.question, retrieved_contexts)

        # 3. Format sources for citation tracking
        sources_used = list(set([
            f"File: {ctx['metadata'].get('source', 'Unknown')} (Page {ctx['metadata'].get('page', 'N/A')})" 
            for ctx in retrieved_contexts
        ]))

        duration_ms = (time.time() - start_time) * 1000
        # Track query telemetry (assuming fallback is triggered if the answer includes fallback indicators or you can check generator flags)
        telemetry.record_query(success=True, used_fallback=False, duration_ms=duration_ms)

        logger.info("Query successfully answered and synthesized.")
        return {
            "status": "success",
            "question": payload.question,
            "answer": synthesized_answer,
            "sources": sources_used
        }
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        telemetry.record_query(success=False, used_fallback=False, duration_ms=duration_ms)
        logger.error(f"Error processing query endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))