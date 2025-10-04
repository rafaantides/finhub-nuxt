import { createError, getRouterParam } from 'h3'
import { fetchWithAuth } from '../../_utils/fetchWithAuth'

export default defineEventHandler(async (event): Promise<void> => {
  const id = getRouterParam(event, 'id')

  try {
    await fetchWithAuth(event, {
      method: 'DELETE',
      path: `/api/v1/invoices/${id}`
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
