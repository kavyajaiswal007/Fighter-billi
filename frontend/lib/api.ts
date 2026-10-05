const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api/backend'

export type DocumentItem = {
  id: string
  name: string
  file_path: string
  file_type: string
  created_at: string
}

export type SourceItem = {
  document: string
  page: number
  snippet: string
}

export type AskResponse = {
  answer: string
  sources: SourceItem[]
}

async function request<T = any>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.detail || 'Request failed')
  }
  return data
}

export async function getDocuments(): Promise<{ documents: DocumentItem[] }> {
  return request('/documents')
}

export async function uploadDocument(file: File): Promise<{
  message: string
  document: DocumentItem
  chunks: number
}> {
  const form = new FormData()
  form.append('file', file)
  return request('/upload', { method: 'POST', body: form })
}

export async function deleteDocument(id: string): Promise<{ message: string }> {
  return request(`/documents/${id}`, { method: 'DELETE' })
}

export async function getDocumentUrl(id: string): Promise<{ url: string }> {
  return request(`/documents/${id}/url`)
}

export async function askBilli(question: string): Promise<AskResponse> {
  return request('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  })
}
