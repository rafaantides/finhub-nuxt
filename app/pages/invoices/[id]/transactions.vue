<script setup lang="ts">
import { usePaginatedData } from '~/composables/usePaginatedData'
import { useTableColumns } from '~/composables/useTableColumns'
import type { Transaction, ApiResponse, Category } from '~/types/api'

const components = {
  UBadge: resolveComponent('UBadge') as Component,
  UCheckbox: resolveComponent('UCheckbox') as Component,
  UButton: resolveComponent('UButton') as Component,
  UDropdownMenu: resolveComponent('UDropdownMenu') as Component
}

const selectedData = ref<Transaction | null>(null)
const isDetailModalOpen = ref(false)
const isNewModalOpen = ref(false)
const isUploadModalOpen = ref(false)

const showDetails = (transaction: Transaction) => {
  selectedData.value = transaction
  isDetailModalOpen.value = true
}

const route = useRoute()
const id = ref(route.params.id?.toString())

const statuses = getQueryParam('statuses')
const recordTypes = getQueryParam('record_types')
const categoryIds = getQueryParam('category_ids')

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
} = usePaginatedData(`invoices/${id.value}/transactions`, [
  { key: 'statuses', ref: statuses },
  { key: 'record_types', ref: recordTypes },
  { key: 'category_ids', ref: categoryIds }
])

const columns = useTableColumns(
  transactionColumnsConfig,
  orderBy,
  orderDirection,
  refresh,
  (row) => getTransactionRowItems(row, showDetails, refresh),
  components
)

// TODO: pegar o valor da fatura e colocar informativo no topo do card
const { data: categoryData } = useFetch<ApiResponse<Category[]>>(
  '/api/categories',
  {
    query: { page_size: 100 },
    lazy: true
  }
)
const categoriesSelect = computed(() =>
  toSelectOptions(categoryData.value?.data)
)

const statusesSelect = computed(() => [
  { label: 'Pendente', value: 'pending' },
  { label: 'Pago', value: 'paid' },
  { label: 'Cancelado', value: 'canceled' }
])

const recordTypesSelect = computed(() => [
  { label: 'Entrada', value: 'income' },
  { label: 'Saída', value: 'expense' }
])
</script>

<template>
  <TransactionsUpsertModal
    v-model:open="isDetailModalOpen"
    :transaction="selectedData"
    :record-types="recordTypesSelect"
    :categories="categoriesSelect"
    :statuses="statusesSelect"
    :refresh="refresh"
    @close="isDetailModalOpen = false"
  />

  <UDashboardPanel id="transactions">
    <template #header>
      <UDashboardNavbar :title="`Fatura: ${id}`">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Adicionar Item"
            icon="i-lucide-plus"
            @click="isNewModalOpen = true"
          />
          <UButton
            label="Adicionar Planilha"
            icon="i-lucide-file-input"
            @click="isUploadModalOpen = true"
          />
          <TransactionsUpsertModal
            v-model:open="isNewModalOpen"
            :transaction="null"
            :record-types="recordTypesSelect"
            :categories="categoriesSelect"
            :statuses="statusesSelect"
            :refresh="refresh"
            @close="isNewModalOpen = false"
          />
          <TransactionsUploadModal
            v-model:open="isUploadModalOpen"
            :refresh="refresh"
            :invoice-id="id ?? null"
            @close="isUploadModalOpen = false"
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
        v-model:record-types="recordTypes"
        v-model:category-ids="categoryIds"
        :data="data"
        :columns="columns"
        :loading="fetchStatus === 'pending'"
        :total="total"
        :statuses-select="statusesSelect"
        :categories-select="categoriesSelect"
        :record-types-select="recordTypesSelect"
        :column-config="transactionColumnsConfig"
        @update:current-page="(val) => (page = val)"
      />
    </template>
  </UDashboardPanel>
</template>
