<script setup lang="ts">
import { usePaginatedData } from '~/composables/usePaginatedData'
import { useTableColumns } from '~/composables/useTableColumns'
import type { Invoice, ApiResponse, PaymentStatus } from '~/types/api'
import {
  invoiceColumnsConfig,
  getInvoiceRowItems
} from '~/composables/useInvoice'

useHead({
  title: 'Dashboard | Faturas',
  meta: [
    {
      name: 'description',
      content: 'Lista de faturas, seus detalhes e status de pagamento'
    },
    { name: 'og:title', content: 'Dashboard | Faturas' },
    {
      name: 'og:description',
      content: 'Lista de faturas, seus detalhes e status de pagamento'
    }
  ]
})

const components = {
  UBadge: resolveComponent('UBadge') as Component,
  UCheckbox: resolveComponent('UCheckbox') as Component,
  UButton: resolveComponent('UButton') as Component,
  UDropdownMenu: resolveComponent('UDropdownMenu') as Component
}

const selectedData = ref<Invoice | null>(null)
const isDetailModalOpen = ref(false)

const showDetails = (invoice: Invoice) => {
  selectedData.value = invoice
  isDetailModalOpen.value = true
}

const statusId = getQueryParam('status_id')

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
} = usePaginatedData('invoices', [{ key: 'status_id', ref: statusId }])

const columns = useTableColumns(
  invoiceColumnsConfig,
  orderBy,
  orderDirection,
  refresh,
  (row) => getInvoiceRowItems(row, showDetails, refresh),
  components
)

const { data: statusesData } = useFetch<ApiResponse<PaymentStatus[]>>(
  '/api/paymentstatus',
  {
    query: { page_size: 100 },
    lazy: true
  }
)
// TODO oq sao todos esses comentarios?
const statuses = computed(() => toSelectOptions(statusesData.value?.data))
</script>

<template>
  <!-- <DebtsDetailModal
    v-model:open="isDetailModalOpen"
    :debt="selectedData"
    :statuses="statuses"
    :refresh="refresh"
    @close="isDetailModalOpen = false"
  /> -->

  <UDashboardPanel id="invoices">
    <template #header>
      <UDashboardNavbar title="Faturas">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <DebtsAddModal :statuses="statuses" :refresh="refresh" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <DataTable
        v-model:current-page="page"
        v-model:page-size="pageSize"
        v-model:search="search"
        v-model:status-id="statusId"
        :data="data"
        :columns="columns"
        :loading="status === 'pending'"
        :total="total"
        :statuses="statuses"
        :column-config="invoiceColumnsConfig"
        @update:current-page="(val) => (page = val)"
      />
    </template>
  </UDashboardPanel>
</template>
