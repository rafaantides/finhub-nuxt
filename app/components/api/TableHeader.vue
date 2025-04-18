<script setup lang="ts">
import { upperFirst } from 'scule'
import type { Column } from '@tanstack/table-core'

const statusFilter = defineModel<string>('status-filter', { required: true })
const table = defineModel<any>('table', { required: true })
</script>

<template>
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
              {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
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
</template>
