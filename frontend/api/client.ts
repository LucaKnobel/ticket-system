const API_BASE_URL = 'http://localhost:3000'

export const apiClient = async (path: string, init?: RequestInit): Promise<Response> => {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
  })
}
