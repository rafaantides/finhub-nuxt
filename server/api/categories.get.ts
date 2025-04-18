import type { ApiResponse, Category } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<ApiResponse<Category[]>> => {
    const config = useRuntimeConfig()
    const { page, page_size } = getQuery(event)

    try {
      const response = await $fetch.raw<Category[]>('/categories', {
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
      // TODO: revisar os any do codigo
    } catch (error: any) {
      console.error('Erro ao buscar dados do backend:', error)
      return {
        error: error
      }
    }
  }
)
