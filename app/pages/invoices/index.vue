<script setup lang="ts">
import { usePaginatedData } from '~/composables/usePaginatedData'
import { useTableColumns } from '~/composables/useTableColumns'
import type { Invoice } from '~/types/api'
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
const isNewModalOpen = ref(false)

const showDetails = (invoice: Invoice) => {
  selectedData.value = invoice
  isDetailModalOpen.value = true
}

const statuses = getQueryParam('statuses')

// TODO: esta se repetindo em várias páginas
const statusesSelect = computed(() => [
  { label: 'Pendente', value: 'pending' },
  { label: 'Pago', value: 'paid' },
  { label: 'Cancelado', value: 'canceled' }
])

const {
  data,
  total,
  fetchStatus,
  page,
  pageSize,
  orderBy,
  orderDirection,
  search,
  refresh
} = usePaginatedData('invoices', [{ key: 'statuses', ref: statuses }])

const columns = useTableColumns(
  invoiceColumnsConfig,
  orderBy,
  orderDirection,
  refresh,
  (row) => getInvoiceRowItems(row, showDetails, refresh),
  components
)
</script>

<template>
  <InvoicesUpsertModal
    v-model:open="isDetailModalOpen"
    :invoice="selectedData"
    :statuses="statusesSelect"
    :refresh="refresh"
    @close="isDetailModalOpen = false"
  />

  <UDashboardPanel id="invoices">
    <template #header>
      <UDashboardNavbar title="Faturas">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Adicionar Fatura"
            icon="i-lucide-plus"
            @click="isNewModalOpen = true"
          />
          <InvoicesUpsertModal
            v-model:open="isNewModalOpen"
            :invoice="null"
            :statuses="statusesSelect"
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
        v-model:statuses="statuses"
        :data="data"
        :columns="columns"
        :loading="fetchStatus === 'pending'"
        :total="total"
        :statuses-select="statusesSelect"
        :column-config="invoiceColumnsConfig"
        @update:current-page="(val) => (page = val)"
      />
    </template>
  </UDashboardPanel>
</template>
