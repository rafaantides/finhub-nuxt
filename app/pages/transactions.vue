<script setup lang="ts">
import { usePaginatedData, getQueryParam } from '~/composables/usePaginatedData'
import { useTableColumns } from '~/composables/useTableColumns'
import type { Transaction, ApiResponse, Category } from '~/types/api'

useHead({
  title: 'Dashboard | Transações',
  meta: [
    {
      name: 'description',
      content: 'Lista de transações e seus detalhes'
    },
    { name: 'og:title', content: 'Dashboard | Transações' },
    {
      name: 'og:description',
      content: 'Lista de transações e seus detalhes'
    }
  ]
})

const components = {
  UBadge: resolveComponent('UBadge') as Component,
  UCheckbox: resolveComponent('UCheckbox') as Component,
  UButton: resolveComponent('UButton') as Component,
  UDropdownMenu: resolveComponent('UDropdownMenu') as Component
}

const selectedData = ref<Transaction | null>(null)
const isDetailModalOpen = ref(false)
const isNewModalOpen = ref(false)

const showDetails = (transaction: Transaction) => {
  selectedData.value = transaction
  isDetailModalOpen.value = true
}

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
} = usePaginatedData('transactions', [
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
      <UDashboardNavbar title="Transações">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #right>
          <UButton
            label="Adicionar Item"
            icon="i-lucide-plus"
            @click="isNewModalOpen = true"
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
