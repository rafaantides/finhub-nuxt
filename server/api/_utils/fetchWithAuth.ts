import { getCookie } from 'h3'

export async function fetchWithAuth<T>(
  event: any,
  path: string,
  opts: any = {}
) {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Não autenticado' })
  }

  return await $fetch.raw<T>(path, {
    baseURL: config.apiBaseUrl,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {})
    },
    ...opts
  })
}
