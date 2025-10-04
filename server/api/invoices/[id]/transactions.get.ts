import { createError } from 'h3'
import { fetchWithAuth } from '../../_utils/fetchWithAuth'
import type { ApiResponse, Transaction } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Transaction[]>> => {
    const id = getRouterParam(event, 'id')

    try {
      const response = await fetchWithAuth<Transaction[]>(event, {
        method: 'GET',
        path: `/api/v1/invoices/${id}/transactions`,
        opts: { query: getQuery(event) }
      })

      const total = response.headers.get('X-Total-Count')
      return {
        data: response._data,
        total: total ? parseInt(total, 10) : null
      }
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

      return { data: [], total: 0 }
    }
  }
)
