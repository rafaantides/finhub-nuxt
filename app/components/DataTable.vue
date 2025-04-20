<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { ColumnConfig } from '~/types/table'

const currentPage = defineModel<number>('currentPage', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
const search = defineModel<string | null>('search')
const statusId = defineModel<string>('statusId')

const props = defineProps<{
  data: any[]
  columns: TableColumn<unknown>[]
  loading: boolean
  total: number
  statuses: { label: string; value: string }[]
  columnConfig: ColumnConfig[]
}>()

const table = useTemplateRef('table')
const rowSelection = ref({})
const columnVisibility = ref()
const columnFilters = ref([])

const pagination = ref({
  pageIndex: currentPage.value - 1,
  pageSize: pageSize.value
})
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-1.5">
    <UInput
      v-model="search"
      class="max-w-sm"
      icon="i-lucide-search"
      placeholder="Search..."
      @update:model-value="(value) => (search = String(value))"
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
              {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
            </UKbd>
          </template>
        </UButton>
      </CustomersDeleteModal>

      <USelect
        v-model="statusId"
        :items="[{ label: 'All' }, ...props.statuses]"
        placeholder="Status"
        clearable
        class="min-w-28"
      />
      <UDropdownMenu
        :items="
          props.columnConfig
            .filter((col) => table?.tableApi?.getColumn(col.key)?.getCanHide())
            .map((col) => {
              const columnApi = table?.tableApi?.getColumn(col.key)
              return {
                label: col.label,
                type: 'checkbox' as const,
                checked: columnApi?.getIsVisible() ?? true,
                onUpdateChecked(checked: boolean) {
                  columnApi?.toggleVisibility(checked)
                },
                onSelect(e?: Event) {
                  e?.preventDefault()
                }
              }
            })
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
    :loading="loading"
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
      <div class="flex items-center gap-2">
        <span class="text-sm text-(--ui-text-muted)">Itens por página</span>
        <USelect
          v-model="pageSize"
          :items="[
            { label: '10', value: 10 },
            { label: '25', value: 25 },
            { label: '50', value: 50 },
            { label: '100', value: 100 }
          ]"
          class="min-w-24"
        />
      </div>
    </div>

    <div class="flex items-center gap-1.5">
      <UPagination
        v-model:page="currentPage"
        :items-per-page="pageSize"
        :total="total"
      />
    </div>
  </div>
</template>
