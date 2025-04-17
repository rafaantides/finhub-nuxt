<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/table-core'
import { upperFirst } from 'scule'
import type { ApiResponse, Debt } from '~/types'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([
  {
    id: 'title',
    value: ''
  }
])
const columnVisibility = ref()
const rowSelection = ref({})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const pagination = ref({
  pageIndex: Number(route.query.page || 1) - 1,
  pageSize: Number(route.query.page_size || config.public.defaultPageSize)
})

const currentPage = computed({
  get: () => pagination.value.pageIndex + 1,
  set: (val) => (pagination.value.pageIndex = val - 1)
})

function getQueryStringParam(param: unknown): string | null {
  return typeof param === 'string' ? param : null
}

const orderBy = ref<string | null>(getQueryStringParam(route.query.order_by))
const orderDirection = ref<string | null>(
  getQueryStringParam(route.query.order_direction)
)

const query = computed(() => ({
  page: currentPage.value,
  page_size: pagination.value.pageSize,
  order_by: orderBy.value,
  order_direction: orderDirection.value
}))

const { data, status, refresh } = useFetch<ApiResponse<Debt[]>>('/api/debts', {
  query,
  lazy: true
})

const debts = computed(() => data.value?.data ?? [])
const total = computed(() => data.value?.total ?? 0)

function syncQueryParam(key: string, valueFn: () => number | string) {
  watch(valueFn, (newValue) => {
    router.replace({
      query: {
        ...route.query,
        [key]: newValue.toString()
      }
    })
  })
}

syncQueryParam('page', () => currentPage.value)
syncQueryParam('page_size', () => pagination.value.pageSize)
syncQueryParam('order_by', () => orderBy.value ?? '')
syncQueryParam('order_direction', () => orderDirection.value ?? '')

function renderSortableHeader(label: string, column: any) {
  const isSorted = orderBy.value === column.id
  const direction = isSorted ? orderDirection.value : undefined

  return h(UButton, {
    color: 'neutral',
    variant: 'ghost',
    label,
    icon: isSorted
      ? direction === 'asc'
        ? 'i-lucide-arrow-up-narrow-wide'
        : 'i-lucide-arrow-down-wide-narrow'
      : 'i-lucide-arrow-up-down',
    class: '-mx-2.5',
    onClick: () => {
      const newDirection =
        isSorted && orderDirection.value === 'asc' ? 'desc' : 'asc'

      orderBy.value = column.id
      orderDirection.value = newDirection
      pagination.value.pageIndex = 0

      refresh()
    }
  })
}

function getRowItems(row: Row<Debt>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy debt ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'Debt ID copied to clipboard'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'View debt details',
      icon: 'i-lucide-list'
    },
    {
      label: 'View debt payments',
      icon: 'i-lucide-wallet'
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete debt',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        toast.add({
          title: 'Debt deleted',
          description: 'The debt has been deleted.'
        })
      }
    }
  ]
}

const columns: TableColumn<Debt>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(!!value),
        ariaLabel: 'Select row'
      })
  },
  {
    accessorKey: 'invoice',
    header: ({ column }) => renderSortableHeader('Fatura', column),
    cell: ({ row }) => row.original.invoice?.title || 'Sem título'
  },
  {
    accessorKey: 'purchase_date',
    header: ({ column }) => renderSortableHeader('Data da Compra', column),
    cell: ({ row }) => {
      const data = row.original.purchase_date
      return data
        ? new Date(data).toLocaleDateString('pt-BR')
        : 'Sem data de compra'
    }
  },
  {
    accessorKey: 'title',
    header: ({ column }) => renderSortableHeader('Título', column)
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => renderSortableHeader('Valor', column),
    cell: ({ row }) => `R$${row.original.amount.toFixed(2)}`
  },
  {
    accessorKey: 'category',
    header: ({ column }) => renderSortableHeader('Categoria', column),
    cell: ({ row }) => row.original.category?.name || 'Sem categoria'
  },
  {
    accessorKey: 'due_date',
    header: ({ column }) => renderSortableHeader('Data de Vencimento', column),
    cell: ({ row }) => {
      const data = row.original.due_date
      return data
        ? new Date(data).toLocaleDateString('pt-BR')
        : 'Sem data de vencimento'
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) => renderSortableHeader('Status', column),
    filterFn: 'equals',
    cell: ({ row }) => {
      const color = {
        paid: 'success' as const,
        overdue: 'error' as const,
        pending: 'warning' as const
      }[row.original.status.name]

      return h(
        UBadge,
        { class: 'capitalize', variant: 'subtle', color },
        () => row.original.status.name
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]

const statusFilter = ref('all')

watch(
  () => statusFilter.value,
  (newVal) => {
    if (!table?.value?.tableApi) return

    const statusColumn = table.value.tableApi.getColumn('status')
    if (!statusColumn) return

    if (newVal === 'all') {
      statusColumn.setFilterValue(undefined)
    } else {
      statusColumn.setFilterValue(newVal)
    }
  }
)
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
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <!-- TODO: fazer o filtro interferir na busca -->
        <UInput
          :model-value="(table?.tableApi?.getColumn('title')?.getFilterValue() as string)"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Filter title..."
          @update:model-value="
            table?.tableApi?.getColumn('title')?.setFilterValue($event)
          "
        />

        <div class="flex flex-wrap items-center gap-1.5">
          <CustomersDeleteModal
            :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
          >
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              label="Delete"
              color="error"
              variant="subtle"
              icon="i-lucide-trash"
            >
              <template #trailing>
                <UKbd>
                  {{
                    table?.tableApi?.getFilteredSelectedRowModel().rows.length
                  }}
                </UKbd>
              </template>
            </UButton>
          </CustomersDeleteModal>

          <USelect
            v-model="statusFilter"
            :items="[
              { label: 'All', value: 'all' },
              { label: 'Subscribed', value: 'subscribed' },
              { label: 'Unsubscribed', value: 'unsubscribed' },
              { label: 'Bounced', value: 'bounced' }
            ]"
            :ui="{
              trailingIcon:
                'group-data-[state=open]:rotate-180 transition-transform duration-200'
            }"
            placeholder="Filter status"
            class="min-w-28"
          />
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Display"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-settings-2"
            />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
        v-model:column-visibility="columnVisibility"
        v-model:row-selection="rowSelection"
        v-model:pagination="pagination"
        class="shrink-0"
        :data="debts"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
          td: 'border-b border-(--ui-border)'
        }"
      />

      <div
        class="flex items-center justify-between gap-3 border-t border-(--ui-border) pt-4 mt-auto"
      >
        <div class="text-sm text-(--ui-text-muted)">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }}
          of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s)
          selected.
        </div>

        <div class="flex items-center gap-1.5">
          <UPagination
            v-model:page="currentPage"
            :items-per-page="pagination.pageSize"
            :total="total"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
