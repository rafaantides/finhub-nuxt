<script setup lang="ts">
import { h } from 'vue'
import type { Row, Column } from '@tanstack/table-core'
import { upperFirst } from 'scule'
import type { TableColumn } from '@nuxt/ui'
import { usePaginatedData } from '~/composables/usePaginatedData'
import type { Debt } from '~/types'
import { renderSortableHeader } from '~/composables/renderSortableHeader'

const table = useTemplateRef('table')
const statusFilter = ref('all')
const rowSelection = ref({})
const columnVisibility = ref()
const columnFilters = ref([])

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

const columns = [
  {
    id: 'select',
    header: ({ table }) =>
      h(components.UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        ariaLabel: 'Select all'
      }),
    cell: ({ row }) =>
      h(components.UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(!!value),
        ariaLabel: 'Select row'
      })
  },
  {
    accessorKey: 'invoice',
    header: ({ column }) =>
      h(
        components.UButton,
        renderSortableHeader(
          'Fatura',
          orderBy,
          orderDirection,
          pagination,
          refresh,
          column
        )
      ),
    cell: ({ row }) => row.original.invoice?.title || 'Sem título'
  },
  {
    accessorKey: 'purchase_date',
    header: ({ column }) =>
      h(
        components.UButton,
        renderSortableHeader(
          'Data da Compra',
          orderBy,
          orderDirection,
          pagination,
          refresh,
          column
        )
      ),
    cell: ({ row }) => {
      const data = row.original.purchase_date
      return data
        ? new Date(data).toLocaleDateString('pt-BR')
        : 'Sem data de compra'
    }
  },
  {
    accessorKey: 'title',
    header: ({ column }) =>
      h(
        components.UButton,
        renderSortableHeader(
          'Título',
          orderBy,
          orderDirection,
          pagination,
          refresh,
          column
        )
      )
  },
  {
    accessorKey: 'amount',
    header: ({ column }) =>
      h(
        components.UButton,
        renderSortableHeader(
          'Valor',
          orderBy,
          orderDirection,
          pagination,
          refresh,
          column
        )
      ),
    cell: ({ row }) => `R$${row.original.amount.toFixed(2)}`
  },
  {
    accessorKey: 'category',
    header: ({ column }) =>
      h(
        components.UButton,
        renderSortableHeader(
          'Categoria',
          orderBy,
          orderDirection,
          pagination,
          refresh,
          column
        )
      ),
    cell: ({ row }) => row.original.category?.name || 'Sem categoria'
  },
  {
    accessorKey: 'due_date',
    header: ({ column }) =>
      h(
        components.UButton,
        renderSortableHeader(
          'Data de Vencimento',
          orderBy,
          orderDirection,
          pagination,
          refresh,
          column
        )
      ),
    cell: ({ row }) => {
      const data = row.original.due_date
      return data
        ? new Date(data).toLocaleDateString('pt-BR')
        : 'Sem data de vencimento'
    }
  },
  {
    accessorKey: 'status',
    header: ({ column }) =>
      h(
        components.UButton,
        renderSortableHeader(
          'Status',
          orderBy,
          orderDirection,
          pagination,
          refresh,
          column
        )
      ),
    filterFn: 'equals',
    cell: ({ row }) => {
      const color = {
        paid: 'success' as const,
        overdue: 'error' as const,
        pending: 'warning' as const
      }[row.original.status.name]

      return h(
        components.UBadge,
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
          components.UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row)
          },
          () =>
            h(components.UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
] as TableColumn<Debt>[]

function getRowItems(row: Row<Debt>) {
  const toast = useToast()

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
      <div class="flex flex-wrap items-center justify-between gap-1.5">
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
            .filter((column: Column<any, unknown>) => column.getCanHide())
            .map((column: Column<any, unknown>) => ({
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
        :data="data"
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
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }}
          row(s) selected.
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
