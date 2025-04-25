import { useRoute, useRouter, useRuntimeConfig } from '#imports'
import type { ApiResponse } from '~/types/api'

interface ExtraQuery {
  key: string
  ref: Ref<any>
}

export function usePaginatedData(
  endpoint: string,
  extraQuery: ExtraQuery[] = []
) {
  const route = useRoute()
  const router = useRouter()
  const config = useRuntimeConfig()

  const page = ref(Number(route.query.page || 1))
  const pageSize = ref(
    Number(route.query.page_size || config.public.defaultPageSize)
  )
  const orderBy = ref(route.query.order_by?.toString() ?? null)
  const orderDirection = ref(route.query.order_direction?.toString() ?? null)
  const search = ref(route.query.search?.toString() ?? null)

  const extraParams = () => {
    const obj: Record<string, any> = {}
    for (const { key, ref } of extraQuery) {
      obj[key] = ref.value
    }
    return obj
  }

  const query = computed(() => ({
    page: page.value,
    page_size: pageSize.value,
    order_by: orderBy.value,
    order_direction: orderDirection.value,
    search: search.value,
    ...extraParams()
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

  watch([page], () => {
    updateQueryParams(router, query)
  })

  watch(
    [
      pageSize,
      orderBy,
      orderDirection,
      search,
      ...extraQuery.map((e) => e.ref)
    ],
    () => {
      page.value = 1
      updateQueryParams(router, query)
    }
  )

  return {
    data: items,
    total,
    status,
    page,
    pageSize,
    orderBy,
    orderDirection,
    search,
    refresh
  }
}

export function getQueryParam(key: string) {
  const route = useRoute()

  const value = route.query[key]

  const param = ref<string[]>(
    Array.isArray(value)
      ? value.map((id) => (id ? String(id) : ''))
      : value
      ? [String(value)]
      : []
  )

  return param
}
