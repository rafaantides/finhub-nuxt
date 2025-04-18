<script setup lang="ts">
import { ref, watch } from 'vue'
import { ApiTable } from '#components'
import { useDebtsColumns } from '~/composables/useDebtsColumns'
import { usePaginatedData } from '~/composables/usePaginatedData'
import type { Debt } from '~/types'
import type { TableState } from '~/components/api/types'

const table = ref()

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
  pagination,
  currentPage,
  orderBy,
  orderDirection,
  refresh
} = usePaginatedData<Debt>('debts')

const rowSelection = ref({})
const statusFilter = ref('all')
const columnVisibility = ref()
const columnFilters = ref([{ id: 'title', value: '' }])

const columns = useDebtsColumns(
  components,
  orderBy,
  orderDirection,
  pagination,
  refresh
)

const tableState = defineModel<TableState>('table-state', { required: true })

tableState.value = {
  data,
  total,
  status,
  columns,
  currentPage,
  pagination,
  filters: {
    columnFilters,
    columnVisibility
  },
  rowSelection,
  table
}

watch(statusFilter, (newVal) => {
  const statusColumn = table.value?.tableApi?.getColumn('status')
  if (!statusColumn) return
  statusColumn.setFilterValue(newVal === 'all' ? undefined : newVal)
})
</script>

<template>
  <UDashboardPanel id="debts">
    <template #header>
      <UDashboardNavbar title="Débitos">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <DebtsAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ApiTableHeader
        v-model:status-filter="statusFilter"
        v-model:table="table"
      />
      <ApiTable v-model:table-state="tableState" />
    </template>
  </UDashboardPanel>
</template>
