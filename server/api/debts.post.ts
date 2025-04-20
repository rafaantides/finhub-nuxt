import { createError, readBody } from 'h3'
import type { ApiResponse, Debt } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Debt | null>> => {
    const config = useRuntimeConfig()
    const body = await readBody<Partial<Debt>>(event)

    try {
      const response = await $fetch.raw<Debt>(`/debts`, {
        method: 'POST',
        baseURL: config.apiBaseUrl,
        body
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

      return { data: null }
    }
  }
)
