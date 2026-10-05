const API_URL = import.meta.env.VITE_API_URL || 'https://fighter-billi.onrender.com'

async function request(path, options) {
  const response = await fetch(`${API_URL}${path}`, options)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const askBilli = async (question) => {
  return request('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  })
}

export const uploadDocument = async (file) => {
  const form = new FormData()
  form.append('file', file)
  return request('/upload', { method: 'POST', body: form })
}

export const getDocuments = async () => request('/documents')

export const deleteDocument = async (id) => request(`/documents/${id}`, { method: 'DELETE' })
