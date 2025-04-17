import type { ApiResponse, Debt } from '~/types'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Debt[]>> => {
    const config = useRuntimeConfig()
    const { page, page_size, order_by, order_direction } = getQuery(event)

    try {
      const response = await $fetch.raw<Debt[]>('/debts', {
        baseURL: config.apiBaseUrl,
        query: {
          page,
          page_size,
          order_by,
          order_direction
        }
      })

      const total = response.headers.get('X-Total-Count')
      return {
        data: response._data,
        total: total ? parseInt(total, 10) : null
      }
      // TODO: revisar os any do codigo
    } catch (error: any) {
      console.error('Erro ao buscar dados do backend:', error)
      return {
        error: error
      }
    }
  }
)
