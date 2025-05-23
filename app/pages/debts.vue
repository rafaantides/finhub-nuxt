<script setup lang="ts">
import { usePaginatedData, getQueryParam } from '~/composables/usePaginatedData'
import { useTableColumns } from '~/composables/useTableColumns'
import type { Debt, ApiResponse, Category, PaymentStatus } from '~/types/api'
import { debtColumnsConfig, getDebtRowItems } from '~/composables/useDebt'

useHead({
  title: 'Dashboard | Débitos',
  meta: [
    {
      name: 'description',
      content: 'Lista de débitos, seus detalhes e status de pagamento'
    },
    { name: 'og:title', content: 'Dashboard | Débitos' },
    {
      name: 'og:description',
      content: 'Lista de débitos, seus detalhes e status de pagamento'
    }
  ]
})

const components = {
  UBadge: resolveComponent('UBadge') as Component,
  UCheckbox: resolveComponent('UCheckbox') as Component,
  UButton: resolveComponent('UButton') as Component,
  UDropdownMenu: resolveComponent('UDropdownMenu') as Component
}

const selectedData = ref<Debt | null>(null)
const isDetailModalOpen = ref(false)
const isNewModalOpen = ref(false)

const showDetails = (debt: Debt) => {
  selectedData.value = debt
  isDetailModalOpen.value = true
}

const statusId = getQueryParam('status_id')
const categoryId = getQueryParam('category_id')

const {
  data,
  total,
  status,
  page,
  pageSize,
  orderBy,
  orderDirection,
  search,
  refresh
} = usePaginatedData('debts', [
  { key: 'status_id', ref: statusId },
  { key: 'category_id', ref: categoryId }
])

const columns = useTableColumns(
  debtColumnsConfig,
  orderBy,
  orderDirection,
  refresh,
  (row) => getDebtRowItems(row, showDetails, refresh),
  components
)

const { data: categoryData } = useFetch<ApiResponse<Category[]>>(
  '/api/categories',
  {
    query: { page_size: 100 },
    lazy: true
  }
)

const { data: statusesData } = useFetch<ApiResponse<PaymentStatus[]>>(
  '/api/paymentstatus',
  {
    query: { page_size: 100 },
    lazy: true
  }
)

const categories = computed(() => toSelectOptions(categoryData.value?.data))
const statuses = computed(() => toSelectOptions(statusesData.value?.data))
</script>

<template>
  <DebtsUpsertModal
    v-model:open="isDetailModalOpen"
    :debt="selectedData"
    :categories="categories"
    :statuses="statuses"
    :refresh="refresh"
    @close="isDetailModalOpen = false"
  />

  <UDashboardPanel id="debts">
    <template #header>
      <UDashboardNavbar title="Débitos">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Adicionar Débito"
            icon="i-lucide-plus"
            @click="isNewModalOpen = true"
          />
          <DebtsUpsertModal
            v-model:open="isNewModalOpen"
            :debt="null"
            :categories="categories"
            :statuses="statuses"
            :refresh="refresh"
            @close="isNewModalOpen = false"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <DataTable
        v-model:current-page="page"
        v-model:page-size="pageSize"
        v-model:search="search"
        v-model:status-id="statusId"
        v-model:category-id="categoryId"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :total="total"
        :statuses="statuses"
        :categories="categories"
        :column-config="debtColumnsConfig"
        @update:current-page="(val) => (page = val)"
      />
    </template>
  </UDashboardPanel>
</template>
