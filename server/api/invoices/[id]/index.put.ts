import { createError, readBody, getRouterParam } from 'h3'
import { fetchWithAuth } from '../../_utils/fetchWithAuth'
import type { Transaction } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<{ data: Transaction | null }> => {
    const id = getRouterParam(event, 'id')
    const body = await readBody<Partial<Transaction>>(event)

    try {
      const response = await fetchWithAuth<Transaction>(event, {
        method: 'PUT',
        path: `/api/v1/invoices/${id}`,
        opts: { body }
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
