import os
import re
from math import sqrt

from dotenv import load_dotenv

load_dotenv()

BUCKET = "documents"
DEFAULT_SUPABASE_URL = "https://lxvwvoppjffswnbsvktf.supabase.co"


def env(name):
    value = os.getenv(name)
    if name == "SUPABASE_URL" and not value:
        return DEFAULT_SUPABASE_URL
    if not value:
        raise RuntimeError(f"Missing environment variable: {name}")
    value = clean_env(value)
    if name == "SUPABASE_URL" and not value.startswith("https://"):
        return DEFAULT_SUPABASE_URL
    return value


def clean_env(value):
    value = value.strip().strip('"').strip("'").replace("\\", "")
    url = re.search(r"https?://[^\s)\]>\"']+", value)
    if url:
        value = url.group(0)
    return value.rstrip("/")


import httpx
from supabase import ClientOptions, create_client

_client = None


def client():
    global _client
    if _client is None:
        http_client = httpx.Client(http2=True, timeout=30.0)
        options = ClientOptions(
            httpx_client=http_client,
            postgrest_client_timeout=30,
            storage_client_timeout=30,
        )
        _client = create_client(env("SUPABASE_URL"), env("SUPABASE_SECRET_KEY"), options=options)
    return _client


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
    return db.table("documents").select("*").order("created_at", desc=True).execute().data


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
