from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import database
from documents import chunk_pages, extract_text
from rag import answer_question, embed, embed_batch

app = FastAPI(title="Fighter Billi API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app|http://(localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AskRequest(BaseModel):
    question: str


@app.get("/")
def health():
    return {"ok": True, "name": "Fighter Billi API"}


@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".pdf", ".docx")):
        raise HTTPException(400, "Only PDF and DOCX files are supported")

    data = await file.read()
    if not data:
        raise HTTPException(400, "Uploaded file is empty")

    try:
        pages = extract_text(file.filename, data)
        chunks = chunk_pages(pages)
        if not chunks:
            raise HTTPException(400, "No text could be extracted from this document")

        file_type = file.filename.rsplit(".", 1)[-1].lower()
        path = f"{uuid4()}.{file_type}"
        database.upload_file(path, data, file.content_type or "application/octet-stream")
        document = database.create_document(file.filename, path, file_type)

        embeddings = embed_batch([chunk["content"] for chunk in chunks])
        rows = [
            {
                "document_id": document["id"],
                "content": chunk["content"],
                "page_number": chunk["page"],
                "embedding": emb,
            }
            for chunk, emb in zip(chunks, embeddings)
        ]
        database.insert_chunks(rows)
        return {"document": document, "chunks": len(rows)}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(500, str(error))


@app.post("/ask")
def ask(body: AskRequest):
    if not body.question.strip():
        raise HTTPException(400, "Question is required")

    try:
        question_embedding = embed(body.question)
        chunks = database.search_chunks(question_embedding, 5)
        useful_chunks = [chunk for chunk in chunks if chunk.get("similarity", 0) > 0.3]
        answer = answer_question(body.question, useful_chunks)
        sources = [{
            "document": chunk["document_name"],
            "page": chunk["page_number"],
            "snippet": chunk["content"][:300],
        } for chunk in useful_chunks[:3]]
        return {"answer": answer, "sources": sources}
    except Exception as error:
        raise HTTPException(500, str(error))


@app.get("/documents")
def documents():
    try:
        return {"documents": database.list_documents()}
    except Exception as error:
        raise HTTPException(500, str(error))


@app.get("/documents/{document_id}/url")
def document_url(document_id: str):
    try:
        url = database.document_url(document_id)
        if not url:
            raise HTTPException(404, "Document not found")
        return {"url": url}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(500, str(error))


@app.delete("/documents/{document_id}")
def delete_document(document_id: str):
    try:
        if not database.delete_document(document_id):
            raise HTTPException(404, "Document not found")
        return {"deleted": True}
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(500, str(error))
