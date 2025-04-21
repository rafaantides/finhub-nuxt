import type { ApiResponse, PaymentStatus } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<ApiResponse<PaymentStatus[]>> => {
    const config = useRuntimeConfig()
    const { page, page_size } = getQuery(event)

    try {
      const response = await $fetch.raw<PaymentStatus[]>('/payment_status', {
        baseURL: config.apiBaseUrl,
        query: {
          page,
          page_size
        }
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
