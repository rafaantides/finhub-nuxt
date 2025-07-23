import { createError } from 'h3'
import type { ApiResponse, Invoice } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Invoice[]>> => {
    const config = useRuntimeConfig()

    try {
      const response = await $fetch.raw<Invoice[]>('/api/v1/invoices', {
        baseURL: config.apiBaseUrl,
        query: getQuery(event)
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
