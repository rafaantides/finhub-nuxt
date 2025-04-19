import type { Router, RouteLocationNormalizedLoaded } from 'vue-router'

export function syncQueryParam(
  key: string,
  route: RouteLocationNormalizedLoaded,
  router: Router,
  valueFn: () => number | string | null
) {
  watch(valueFn, (newValue) => {
    router.replace({
      query: {
        ...route.query,
        [key]: newValue?.toString()
      }
    })
  })
}
