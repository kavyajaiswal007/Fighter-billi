import os
from math import sqrt

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

BUCKET = "documents"


def env(name):
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing environment variable: {name}")
    return value


def client():
    return create_client(env("SUPABASE_URL"), env("SUPABASE_SECRET_KEY"))


def upload_file(path, data, content_type):
    return client().storage.from_(BUCKET).upload(
        path,
        data,
        {"content-type": content_type, "upsert": "true"},
    )


def create_document(name, path, file_type):
    result = client().table("documents").insert({
        "name": name,
        "file_path": path,
        "file_type": file_type,
    }).execute()
    return result.data[0]


def insert_chunks(rows):
    return client().table("document_chunks").insert(rows).execute()


def list_documents():
    db = client()
    docs = db.table("documents").select("*").order("created_at", desc=True).execute().data
    for doc in docs:
        doc["url"] = db.storage.from_(BUCKET).create_signed_url(doc["file_path"], 3600)["signedURL"]
    return docs


def delete_document(document_id):
    db = client()
    doc = db.table("documents").select("file_path").eq("id", document_id).single().execute().data
    if not doc:
        return False
    db.storage.from_(BUCKET).remove([doc["file_path"]])
    db.table("documents").delete().eq("id", document_id).execute()
    return True


def document_url(document_id):
    db = client()
    doc = db.table("documents").select("file_path").eq("id", document_id).single().execute().data
    if not doc:
        return None
    return db.storage.from_(BUCKET).create_signed_url(doc["file_path"], 3600)["signedURL"]


def search_chunks(embedding, count=5):
    db = client()
    rows = db.rpc("match_document_chunks", {
        "query_embedding": embedding,
        "match_count": count,
    }).execute().data
    if rows:
        return rows

    chunks = db.table("document_chunks").select(
        "content,page_number,embedding,documents(name)"
    ).execute().data
    scored = []
    for chunk in chunks:
        stored = parse_embedding(chunk["embedding"])
        scored.append({
            "content": chunk["content"],
            "page_number": chunk["page_number"],
            "document_name": chunk["documents"]["name"],
            "similarity": cosine(embedding, stored),
        })
    return sorted(scored, key=lambda row: row["similarity"], reverse=True)[:count]


def parse_embedding(value):
    if isinstance(value, list):
        return value
    return [float(item) for item in value.strip("[]").split(",")]


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sqrt(sum(x * x for x in a))
    norm_b = sqrt(sum(y * y for y in b))
    return dot / (norm_a * norm_b) if norm_a and norm_b else 0
