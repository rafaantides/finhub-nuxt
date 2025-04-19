import { useRoute, useRouter, useRuntimeConfig } from '#imports'
import type { ApiResponse } from '~/types'

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

  const { data, refresh, status } = useFetch<ApiResponse<unknown[]>>(
    `/api/${endpoint}`,
    {
      query,
      lazy: true
    }
  )

  const items = computed(() => data.value?.data ?? [])
  const total = computed(() => data.value?.total ?? 0)

  const updateQueryParams = () => {
    const params: Record<string, any> = {}

    // Adiciona os parâmetros somente se houver valor
    if (currentPage.value) params.page = currentPage.value
    if (pageSize.value !== config.public.defaultPageSize)
      params.page_size = pageSize.value
    if (orderBy.value) params.order_by = orderBy.value
    if (orderDirection.value) params.order_direction = orderDirection.value

    // Atualiza a URL somente se houver mudanças nos parâmetros
    if (Object.keys(params).length > 0) {
      router.replace({ query: params })
    }
  }

  watch([orderBy, orderDirection], () => {
    currentPage.value = 1
    updateQueryParams()
  })

  watch([currentPage, pageSize, orderBy, orderDirection], updateQueryParams)

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
