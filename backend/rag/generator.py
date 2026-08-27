import os
from openai import OpenAI
import urllib.request
import json

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def query_ollama(prompt: str) -> str:
    """Fallback generator using a local Ollama model (e.g., phi3)"""
    url = "http://localhost:11434/api/generate"
    payload = {
        "model": "phi3",  # Make sure you pulled this model via 'ollama run phi3'
        "prompt": prompt,
        "stream": False
    }
    
    req = urllib.request.Request(
        url, 
        data=json.dumps(payload).encode('utf-8'), 
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = json.loads(response.read().decode('utf-8'))
            return res_body.get("response", "No response from local model.")
    except Exception as e:
        return f"Local fallback failed (Is Ollama running?): {str(e)}"

def generate_rag_answer(question: str, retrieved_chunks: list) -> str:
    """
    Attempts OpenAI first. If quota/billing fails, automatically 
    falls back to a local Ollama model.
    """
    # Combine the text from the retrieved chunks into a single context string
    context_text = "\n\n".join([
        f"[Source: {chunk['metadata'].get('source', 'Unknown')} - Page {chunk['metadata'].get('page', 'N/A')}]\n{chunk['text']}"
        for chunk in retrieved_chunks
    ])

    prompt = f"""You are an expert AI maintenance and compliance assistant. 
Answer the user's question using ONLY the provided context below. 
If the answer cannot be found in the context, state clearly that the information is missing from the uploaded documents.
Always cite the source file and page number when stating facts.

Context:
{context_text}

User Question: {question}

Answer:"""

    # Try OpenAI first
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful technical documentation assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )
        return response.choices[0].message.content
    except Exception as e:
        # Check if it's a quota or rate-limit error
        error_str = str(e)
        if "insufficient_quota" in error_str or "429" in error_str:
            print("⚠️ OpenAI quota exceeded. Automatically switching to local Ollama model...")
            return query_ollama(prompt)
        else:
            return f"Error generating AI response: {error_str}"
        