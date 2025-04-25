import type { Router } from 'vue-router'
import type { ComputedRef } from 'vue'

export function updateQueryParams(
  router: Router,
  query: ComputedRef<Record<string, any>>
) {
  const config = useRuntimeConfig()

  const params: Record<string, any> = {}

  for (const [key, value] of Object.entries(query.value)) {
    console.log('key', key, 'value', value)
    if (
      value === null ||
      value === undefined ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'string' && value.trim() === '')
    ) {
      continue
    }

    // Evita colocar page_size se for o valor padrão
    if (key === 'page_size' && value === config.public.defaultPageSize) {
      continue
    }

    params[key] = value
  }

  router.replace({ query: params })
}
