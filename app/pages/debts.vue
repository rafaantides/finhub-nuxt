<script setup lang="ts">
import { usePaginatedData } from '~/composables/usePaginatedData'
import { useTableColumns } from '~/composables/table/useTableColumns'
import type { Debt, ApiResponse, Category, PaymentStatus } from '~/types/api'
import {
  debtColumnsConfig,
  debtGetRowItems
} from '~/composables/table/useDebtTableColumns'

const components = {
  UBadge: resolveComponent('UBadge') as Component,
  UCheckbox: resolveComponent('UCheckbox') as Component,
  UButton: resolveComponent('UButton') as Component,
  UDropdownMenu: resolveComponent('UDropdownMenu') as Component
}

const selectedDebt = ref<Debt | null>(null)
const isDebtModalOpen = ref(false)

const showDebtDetails = (debt: Debt) => {
  selectedDebt.value = debt
  isDebtModalOpen.value = true
}

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
} = usePaginatedData('debts')

const columns = useTableColumns(
  debtColumnsConfig,
  orderBy,
  orderDirection,
  refresh,
  (row) => debtGetRowItems(row, showDebtDetails, refresh),
  components
)

// TODO: rever os fecth e os seus retorno q vem a chave data
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
    v-model:open="isDebtModalOpen"
    :debt="selectedDebt"
    :categories="categories"
    :statuses="statuses"
    :refresh="refresh"
    @close="isDebtModalOpen = false"
  />

  <UDashboardPanel id="debts">
    <template #header>
      <UDashboardNavbar title="Débitos">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <DebtsAddModal :categories="categories" :statuses="statuses" />
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
