import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

EMBEDDING_MODEL = "gemini-embedding-001"
CHAT_MODEL = "gemini-flash-lite-latest"


def gemini():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        raise RuntimeError("Missing environment variable: GEMINI_API_KEY")
    return genai.Client(api_key=key)


def embed(text):
    client = gemini()
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(output_dimensionality=768),
    )
    return result.embeddings[0].values


def answer_question(question, chunks):
    if not chunks:
        return "I could not find that answer in the uploaded documents."

    context = "\n\n".join(
        f"Document: {chunk['document_name']} | Page: {chunk['page_number']}\n{chunk['content']}"
        for chunk in chunks
    )
    prompt = f"""
Answer only from the document context. If the answer is not in the context, say:
I could not find that answer in the uploaded documents.

Context:
{context}

Question: {question}
"""
    client = gemini()
    result = client.models.generate_content(model=CHAT_MODEL, contents=prompt)
    return result.text.strip()
