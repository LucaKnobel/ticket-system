/**
 * Minimal fetch wrapper for frontend API calls.
 *
 * It always sends credentials so HTTP-only session cookies are included
 * for authenticated requests.
 *
 * @param path Relative API path.
 * @param init Optional fetch init options.
 * @returns Native fetch response.
 */
export const apiClient = async (path: string, init?: RequestInit): Promise<Response> => {
  return fetch(path, {
    credentials: 'include',
    ...init,
  })
}
