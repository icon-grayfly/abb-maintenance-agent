import os
import io
import pymupdf  # PyMuPDF
from docx import Document  # For .docx files
from langchain_text_splitters import RecursiveCharacterTextSplitter

def process_document(file_bytes: bytes, filename: str):
    """
    Parses PDF, DOCX, or Markdown files, extracts text,
    and returns chunked text with structural metadata.
    """
    ext = filename.split(".")[-1].lower()
    documents = []

    if ext == "pdf":
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                documents.append({
                    "page": page_num + 1,
                    "text": text,
                    "source": filename,
                    "format": "pdf"
                })
    elif ext == "docx":
        doc = Document(io.BytesIO(file_bytes))
        full_text = "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
        if full_text.strip():
            documents.append({
                "page": 1,
                "text": full_text,
                "source": filename,
                "format": "docx"
            })
    elif ext == "md":
        text = file_bytes.decode("utf-8")
        if text.strip():
            documents.append({
                "page": 1,
                "text": text,
                "source": filename,
                "format": "markdown"
            })
    else:
        raise ValueError(f"Unsupported file format: .{ext}")

    # Chunk text to preserve semantic structure
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = []
    for doc_item in documents:
        split_texts = text_splitter.split_text(doc_item["text"])
        for chunk_idx, chunk in enumerate(split_texts):
            chunks.append({
                "id": f"{filename}_p{doc_item['page']}_c{chunk_idx}",
                "text": chunk,
                "metadata": {
                    "source": doc_item["source"],
                    "page": doc_item["page"],
                    "format": doc_item["format"]
                }
            })

    return chunks