import { createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event): Promise<void> => {
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  try {
    await $fetch.raw(`/api/v1/transactions/${id}`, {
      method: 'DELETE',
      baseURL: config.apiBaseUrl
    })
  } catch (error: any) {
    sendError(
      event,
      createError({
        statusCode: error.response?.status || 500,
        statusMessage:
          error.response?._data?.message || error.message || 'Erro interno',
        data: error.response?._data?.details || 'Erro desconhecido'
      })
    )
  }
})
