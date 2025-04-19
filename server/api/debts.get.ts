import { createError } from 'h3'
import type { ApiResponse, Debt } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Debt[]>> => {
    const config = useRuntimeConfig()

    try {
      const response = await $fetch.raw<Debt[]>('/debts', {
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
          data: error.response?._data?.details || 'Erro desconhecido' // Use direto o conteúdo desejado
        })
      )

      return { data: [], total: 0 }
    }
  }
)
