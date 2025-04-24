import type { Router } from 'vue-router'
import type { Ref } from 'vue'

export function updateQueryParams(
  router: Router,
  page: Ref<number>,
  pageSize: Ref<number>,
  orderBy: Ref<string | null>,
  orderDirection: Ref<string | null>,
  search: Ref<string | null>,
  statusId: Ref<string[] | undefined>,
  categoryId: Ref<string[] | undefined>
) {
  const config = useRuntimeConfig()
  const params: Record<string, any> = {}

  // Adicionando os parâmetros com checagens de valores
  if (page.value) params.page = page.value
  if (pageSize.value !== config.public.defaultPageSize)
    params.page_size = pageSize.value
  if (orderBy.value) params.order_by = orderBy.value
  if (orderDirection.value) params.order_direction = orderDirection.value
  if (search.value) params.search = search.value

  if (statusId.value && statusId.value.length > 0)
    params.status_id = statusId.value
  if (categoryId.value && categoryId.value.length > 0)
    params.category_id = categoryId.value

  if (Object.keys(params).length > 0) {
    router.replace({ query: params })
  }
}
