import { createError, readBody } from 'h3'
import type { Transaction } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<{ data: Transaction | null }> => {
    const config = useRuntimeConfig()
    const body = await readBody<Partial<Transaction>>(event)

    try {
      const response = await $fetch.raw<Transaction>(`/api/v1/invoices`, {
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
