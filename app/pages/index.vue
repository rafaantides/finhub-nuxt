<script setup lang="ts">
import { sub } from 'date-fns'
import type { Period, Range } from '~/types'
import type { Category } from '~/types/api'

useHead({
  title: 'Dashboard | Home',
  meta: [
    {
      name: 'description',
      content: 'Resumo financeiro e gráficos por categoria'
    },
    { name: 'og:title', content: 'Dashboard | Home' },
    {
      name: 'og:description',
      content: 'Resumo financeiro e gráficos por categoria'
    }
  ]
})

const { isNotificationsSlideoverOpen } = useDashboard()

const items = [
  [
    {
      label: 'New mail',
      icon: 'i-lucide-send',
      to: '/inbox'
    },
    {
      label: 'New customer',
      icon: 'i-lucide-user-plus',
      to: '/customers'
    }
  ]
]

const config = useRuntimeConfig()

const range = shallowRef<Range>({
  start: sub(new Date(), { days: 30 }),
  end: new Date()
})
const period = ref<Period>('daily')

// TODO: ver se tem como pegar a cor primaria de outra forma
const totalCategory = ref<Category>({
  id: 'total',
  name: 'total',
  // TODO: colocar numa config
  color: config.public.uncategorizedColor,
  description: 'Soma total de todas as categorias'
})

const dataCategories = ref<Category[]>([])

onMounted(() => {
  const root = document.documentElement
  const primaryColor = getComputedStyle(root)
    .getPropertyValue('--ui-primary')
    .trim()
  totalCategory.value.color = primaryColor
})

const { data: response } = await useFetch<{ data: Category[] }>(
  '/api/categories',
  {
    query: {
      page_size: 100
    }
  }
)
dataCategories.value = [totalCategory.value, ...(response.value?.data || [])]

const { data } = useTransactionSummary(period, range)
const { data: stats } = useTransactionStats(period, range)
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <HomeDateRangePicker v-model="range" class="-ms-1" />

          <HomePeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <HomeStats v-model:data="stats" :period="period" :range="range" />
      <HomeChart
        v-if="dataCategories.length"
        v-model:period="period"
        v-model:data="data"
        :categories="dataCategories"
      />
      <HomeTable v-model:data="data" :categories="dataCategories" />
    </template>
  </UDashboardPanel>
</template>
