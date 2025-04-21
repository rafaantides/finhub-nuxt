<script setup lang="ts">
import { usePaginatedData } from '~/composables/usePaginatedData'
import { useTableColumns } from '~/composables/useTableColumns'
import type { Debt, ApiResponse, Category, PaymentStatus } from '~/types/api'
import { debtColumnsConfig, getDebtRowItems } from '~/composables/useDebt'

const components = {
  UBadge: resolveComponent('UBadge') as Component,
  UCheckbox: resolveComponent('UCheckbox') as Component,
  UButton: resolveComponent('UButton') as Component,
  UDropdownMenu: resolveComponent('UDropdownMenu') as Component
}

const selectedData = ref<Debt | null>(null)
const isDetailModalOpen = ref(false)

const showDetails = (debt: Debt) => {
  selectedData.value = debt
  isDetailModalOpen.value = true
}

const route = useRoute()
const id = ref(route.params.id?.toString())

const {
  data,
  total,
  status,
  currentPage,
  pageSize,
  orderBy,
  orderDirection,
  search,
  statusId,
  refresh
} = usePaginatedData(`invoices/${id.value}/debts`)

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
  <DebtsDetailModal
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
          <DebtsAddModal
            :categories="categories"
            :statuses="statuses"
            :refresh="refresh"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <DataTable
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        v-model:search="search"
        v-model:status-id="statusId"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :total="total"
        :statuses="statuses"
        :column-config="debtColumnsConfig"
        @update:current-page="(val) => (currentPage = val)"
      />
    </template>
  </UDashboardPanel>
</template>
