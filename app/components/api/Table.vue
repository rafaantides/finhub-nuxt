<script setup lang="ts">
import type { TableState } from './types'

const tableState = defineModel<TableState>('table-state', { required: true })
</script>

<template>
  <UTable
    ref="table"
    v-model:column-filters="tableState.filters.columnFilters"
    v-model:column-visibility="tableState.filters.columnVisibility"
    v-model:row-selection="tableState.rowSelection.value"
    v-model:pagination="tableState.pagination.value"
    class="shrink-0"
    :data="tableState.data.value"
    :columns="tableState.columns"
    :loading="tableState.status.value === 'pending'"
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
      {{
        tableState.table?.tableApi?.getFilteredSelectedRowModel().rows.length ||
        0
      }}
      of
      {{ tableState.table?.tableApi?.getFilteredRowModel().rows.length || 0 }}
      row(s) selected.
    </div>

    <div class="flex items-center gap-1.5">
      <UPagination
        v-model:page="tableState.currentPage.value"
        :items-per-page="tableState.pagination.value.pageSize"
        :total="tableState.total.value"
      />
    </div>
  </div>
</template>
