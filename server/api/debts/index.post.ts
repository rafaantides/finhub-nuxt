import { createError, readBody } from 'h3'
import type { Debt } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<{ data: Debt | null }> => {
    const config = useRuntimeConfig()
    const body = await readBody<Partial<Debt>>(event)

    try {
      const response = await $fetch.raw<Debt>(`/debts`, {
        method: 'POST',
        baseURL: config.apiBaseUrl,
        body
      })

      return {
        data: response._data ?? null
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
