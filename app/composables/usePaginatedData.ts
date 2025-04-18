import { syncQueryParam } from '../utils/syncQueryParam'
import { useRoute, useRouter, useRuntimeConfig } from '#imports'
import type { ApiResponse } from '~/types'

export function usePaginatedData(endpoint: string) {
  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()

  const pagination = ref({
    pageIndex: Number(route.query.page || 1) - 1,
    pageSize: Number(route.query.page_size || config.public.defaultPageSize)
  })

  const currentPage = computed({
    get: () => pagination.value.pageIndex + 1,
    set: (val) => (pagination.value.pageIndex = val - 1)
  })

  const orderBy = ref<string | null>(getQueryStringParam(route.query.order_by))
  const orderDirection = ref<string | null>(
    getQueryStringParam(route.query.order_direction)
  )

  const query = computed(() => ({
    page: currentPage.value,
    page_size: pagination.value.pageSize,
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

  syncQueryParam('page', route, router, () => currentPage.value)
  syncQueryParam('page_size', route, router, () => pagination.value.pageSize)
  syncQueryParam('order_by', route, router, () => orderBy.value ?? '')
  syncQueryParam(
    'order_direction',
    route,
    router,
    () => orderDirection.value ?? ''
  )

  return {
    data: items,
    total,
    status,
    pagination,
    currentPage,
    orderBy,
    orderDirection,
    refresh
  }
}
