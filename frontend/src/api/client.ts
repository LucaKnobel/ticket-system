export const apiClient = async (path: string, init?: RequestInit): Promise<Response> => {
  return fetch(path, {
    credentials: 'include',
    ...init,
  })
}
