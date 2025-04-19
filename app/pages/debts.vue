<script setup lang="ts">
import { usePaginatedData } from '~/composables/usePaginatedData'
import { useTableColumns } from '~/composables/table/useTableColumns'
import {
  debtColumnsConfig,
  debtGetRowItems
} from '~/composables/table/useDebtTableColumns'

// const statusFilter = ref('all')

const components = {
  UBadge: resolveComponent('UBadge') as Component,
  UCheckbox: resolveComponent('UCheckbox') as Component,
  UButton: resolveComponent('UButton') as Component,
  UDropdownMenu: resolveComponent('UDropdownMenu') as Component
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
  refresh
} = usePaginatedData('debts')

const columns = useTableColumns(
  debtColumnsConfig,
  orderBy,
  orderDirection,
  refresh,
  debtGetRowItems,
  components
)

// watch(statusFilter, (newVal) => {
//   const statusColumn = table.value?.tableApi?.getColumn('status')
//   if (!statusColumn) return
//   statusColumn.setFilterValue(newVal === 'all' ? undefined : newVal)
// })
</script>

<template>
  <UDashboardPanel id="debts">
    <DataTable
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      v-model:search="search"
      :data="data"
      :columns="columns"
      :loading="status === 'pending'"
      :total="total"
      @update:current-page="(val) => (currentPage = val)"
    />
  </UDashboardPanel>
</template>

<!-- :status-filter="statusFilter" -->
