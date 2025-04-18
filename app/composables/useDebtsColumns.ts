import { h } from 'vue'
import type { Row } from '@tanstack/table-core'
import type { TableColumn } from '@nuxt/ui'
import type { Debt } from '~/types'
import { renderSortableHeader } from '~/composables/renderSortableHeader'

type Components = {
  UBadge: Component
  UCheckbox: Component
  UButton: Component
  UDropdownMenu: Component
}

export function useDebtsColumns(
  components: Components,
  orderBy: { value: string | null },
  orderDirection: { value: string | null },
  pagination: { value: { pageIndex: number; pageSize: number } },
  refresh: () => void
) {
  return [
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
}

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
