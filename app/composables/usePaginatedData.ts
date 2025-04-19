import { useRoute, useRouter, useRuntimeConfig } from '#imports'
import type { ApiResponse } from '~/types/api'

export function usePaginatedData(endpoint: string) {
  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()

  const currentPage = ref(Number(route.query.page || 1))
  const pageSize = ref(
    Number(route.query.page_size || config.public.defaultPageSize)
  )
  const orderBy = ref(route.query.order_by?.toString() ?? null)
  const orderDirection = ref(route.query.order_direction?.toString() ?? null)

  const query = computed(() => ({
    page: currentPage.value,
    page_size: pageSize.value,
    order_by: orderBy.value,
    order_direction: orderDirection.value
  }))

  const { data, refresh, status, error } = useFetch<ApiResponse<unknown[]>>(
    `/api/${endpoint}`,
    {
      query,
      lazy: true
    }
  )

  watchEffect(() => {
    if (error.value) {
      showError({
        statusCode: error.value.statusCode || 500,
        statusMessage: error.value.statusMessage || 'Erro interno',
        data: error.value.data.data || null
      })
    }
  })

  const items = computed(() => data.value?.data ?? [])
  const total = computed(() => data.value?.total ?? 0)

  watch([orderBy, orderDirection], () => {
    currentPage.value = 1
    updateQueryParams(router, currentPage, pageSize, orderBy, orderDirection)
  })

  watch([currentPage, pageSize, orderBy, orderDirection], () => {
    updateQueryParams(router, currentPage, pageSize, orderBy, orderDirection)
  })

  return {
    data: items,
    total,
    status,
    currentPage,
    pageSize,
    orderBy,
    orderDirection,
    refresh
  }
}
