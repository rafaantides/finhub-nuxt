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

export function getDebtRowItems(
  row: Row<Debt>,
  showDetails: (debt: Debt) => void,
  refresh: () => void
) {
  const toast = useToast()

  return [
    {
      type: 'label',
      label: 'Ações'
    },
    {
      label: 'Copiar ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copiado para a área de transferência',
          description: `ID: ${row.original.id}`
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Ver detalhes',
      icon: 'i-lucide-list',
      onSelect() {
        showDetails(row.original)
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'Excluir',
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
            title: 'Erro ao excluir débito',
            description: error?.data?.message || error.message,
            color: 'error'
          })
        }
      }
    }
  ]
}
