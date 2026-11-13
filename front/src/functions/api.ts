export const API_URL = 'https://localhost:3000/api/v1'

export async function apiRequest(path: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!response.ok) {
    throw new Error(`La requête API a échoué (${response.status})`)
  }
  return response
}
