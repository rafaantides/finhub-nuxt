import type { Router } from 'vue-router'
import type { Ref } from 'vue'

export function updateQueryParams(
  router: Router,
  page: Ref<number>,
  pageSize: Ref<number>,
  orderBy: Ref<string | null>,
  orderDirection: Ref<string | null>,
  search: Ref<string | null>
) {
  const config = useRuntimeConfig()
  const params: Record<string, any> = {}

  if (page.value) params.page = page.value
  if (pageSize.value !== config.public.defaultPageSize)
    params.page_size = pageSize.value
  if (orderBy.value) params.order_by = orderBy.value
  if (orderDirection.value) params.order_direction = orderDirection.value
  if (search.value) params.search = search.value

  if (Object.keys(params).length > 0) {
    router.replace({ query: params })
  }
}
