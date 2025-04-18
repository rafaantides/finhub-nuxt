// composables/table/useTableColumns.ts
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { ColumnConfig } from './columns-config'
import { renderSortableHeader } from '~/utils/renderSortableHeader'

export function useTableColumns<T>(
  config: ColumnConfig[],
  orderBy: { value: string | null },
  orderDirection: { value: string | null },
  pagination: any,
  refresh: () => void,
  getRowItems: (row: any) => any[],
  components: {
    UCheckbox: any
    UButton: any
    UBadge: any
    UDropdownMenu: any
  }
): TableColumn<T>[] {
  const columns: TableColumn<T>[] = [
    {
      id: 'select',
      header: ({ table }) =>
        h(components.UCheckbox, {
          modelValue: table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : table.getIsAllPageRowsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            table.toggleAllPageRowsSelected(!!value),
          ariaLabel: 'Selecionar tudo'
        }),
      cell: ({ row }) =>
        h(components.UCheckbox, {
          modelValue: row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            row.toggleSelected(!!value),
          ariaLabel: 'Selecionar linha'
        })
    },
    ...config.map((col) => {
      const base: TableColumn<T> = {
        accessorKey: col.key,
        header: ({ column }) =>
          col.sortable
            ? h(
                components.UButton,
                renderSortableHeader(
                  col.label,
                  orderBy,
                  orderDirection,
                  pagination,
                  refresh,
                  column
                )
              )
            : col.label,
        cell: ({ row }) => {
          const original = row.original as any
          const value = col.nestedKey
            ? col.nestedKey.split('.').reduce((acc, k) => acc?.[k], original)
            : original[col.key]

          if (col.type === 'date') {
            return value
              ? new Date(value).toLocaleDateString('pt-BR')
              : 'Sem data'
          }

          if (col.type === 'currency') {
            return value != null ? `R$${value.toFixed(2)}` : 'Sem valor'
          }

          if (col.type === 'status') {
            type StatusName = 'paid' | 'overdue' | 'pending'

            const statusName = (value?.name || 'pending') as StatusName

            const color = {
              paid: 'success',
              overdue: 'error',
              pending: 'warning'
            }[statusName]

            return h(
              components.UBadge,
              { class: 'capitalize', variant: 'subtle', color },
              () => value?.name || 'Desconhecido'
            )
          }

          return value || `Sem ${col.label.toLowerCase()}`
        }
      }

      return base
    }),
    {
      id: 'actions',
      cell: ({ row }) =>
        h(
          'div',
          { class: 'text-right' },
          h(
            components.UDropdownMenu,
            {
              content: { align: 'end' },
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
  ]

  return columns
}
