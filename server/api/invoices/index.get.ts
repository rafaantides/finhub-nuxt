import { createError } from 'h3'
import { fetchWithAuth } from '../_utils/fetchWithAuth'
import type { ApiResponse, Invoice } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Invoice[]>> => {
    try {
      const response = await fetchWithAuth<Invoice[]>(
        event,
        '/api/v1/invoices',
        {
          query: getQuery(event)
        }
      )

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
