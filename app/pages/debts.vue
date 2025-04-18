<script setup lang="ts">
import type { Column } from '@tanstack/table-core'
import { upperFirst } from 'scule'
import { usePaginatedData } from '~/composables/usePaginatedData'
import type { Debt } from '~/types'
import { useTableColumns } from '~/composables/table/useTableColumns'
import {
  debtColumnsConfig,
  debtGetRowItems
} from '~/composables/table/columns-config'

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

const columns = useTableColumns<Debt>(
  debtColumnsConfig,
  orderBy,
  orderDirection,
  pagination,
  refresh,
  debtGetRowItems,
  components
)

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
