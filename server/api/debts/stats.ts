import { createError } from 'h3'
import type { ApiResponse, Debt } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Debt[]>> => {
    const config = useRuntimeConfig()

    try {
      const response = await $fetch.raw<Debt[]>('/debts/stats', {
        baseURL: config.apiBaseUrl,
        query: getQuery(event)
      })

      return {
        data: response._data
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
