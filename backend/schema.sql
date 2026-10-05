create extension if not exists vector;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  file_path text not null,
  file_type text not null,
  created_at timestamptz default now()
);

create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  content text not null,
  page_number int not null,
  embedding vector(768) not null
);

create index if not exists document_chunks_embedding_idx
on document_chunks using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

create or replace function match_document_chunks(
  query_embedding vector(768),
  match_count int default 5
)
returns table (
  content text,
  page_number int,
  document_name text,
  similarity float
)
language sql stable
as $$
  select
    c.content,
    c.page_number,
    d.name as document_name,
    1 - (c.embedding <=> query_embedding) as similarity
  from document_chunks c
  join documents d on d.id = c.document_id
  order by c.embedding <=> query_embedding
  limit match_count;
$$;
