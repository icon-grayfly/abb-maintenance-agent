from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

app = FastAPI(title="Maintenance AI Agent API")

class QueryRequest(BaseModel):
    question: str

@app.post("/ingest")
async def ingest_document(file: UploadFile = File(...)):
    return {"message": f"Successfully received {file.filename} for processing."}

@app.post("/query")
async def query_agent(request: QueryRequest):
    return {
        "answer": f"Mock answer for: '{request.question}'",
        "sources": ["manual_page_42.pdf"]
    }