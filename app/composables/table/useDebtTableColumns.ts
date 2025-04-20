import type { Row } from '@tanstack/table-core'
import type { Debt } from '~/types/api'
import type { ColumnConfig } from '~/types/table'

export const debtColumnsConfig: ColumnConfig[] = [
  {
    key: 'invoice',
    label: 'Fatura',
    sortable: true,
    nestedKey: 'invoice.title'
  },
  {
    key: 'purchase_date',
    label: 'Data da Compra',
    sortable: true,
    type: 'date'
  },
  { key: 'title', label: 'Título', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true, type: 'currency' },
  {
    key: 'category',
    label: 'Categoria',
    sortable: true,
    nestedKey: 'category.name'
  },
  {
    key: 'due_date',
    label: 'Data de Vencimento',
    sortable: true,
    type: 'date'
  },
  { key: 'status', label: 'Status', sortable: true, type: 'status' }
]

export function debtGetRowItems(
  row: Row<Debt>,
  showDebtDetails: (debt: Debt) => void,
  refresh: () => void
) {
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
      icon: 'i-lucide-list',
      onSelect() {
        showDebtDetails(row.original)
      }
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
      async onSelect() {
        try {
          await $fetch(`/api/debts/${row.original.id}`, {
            method: 'DELETE'
          })

          refresh()

          toast.add({
            title: 'Débito removido com sucesso',
            description: `ID: ${row.original.id}`,
            color: 'success'
          })
        } catch (error: any) {
          toast.add({
            title: 'Erro ao deletar débito',
            description: error?.data?.message || error.message,
            color: 'error'
          })
        }
      }
    }
  ]
}
