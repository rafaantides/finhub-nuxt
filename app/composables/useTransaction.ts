import type { Row } from '@tanstack/table-core'
import type { Transaction } from '~/types/api'
import type { ColumnConfig } from '~/types/table'

export const transactionColumnsConfig: ColumnConfig[] = [
  {
    key: 'record_date',
    label: 'Data',
    sortable: true,
    type: 'date'
  },
  { key: 'record_type', label: 'Tipo', sortable: true, type: 'recordType' },
  { key: 'title', label: 'Título', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true, type: 'currency' },
  {
    key: 'category',
    label: 'Categoria',
    sortable: true,
    nestedKey: 'category.name'
  },
  { key: 'status', label: 'Status', sortable: true, type: 'status' }
]

export function getTransactionRowItems(
  row: Row<Transaction>,
  showDetails: (transaction: Transaction) => void,
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
      label: 'Editar',
      icon: 'i-lucide-square-pen',
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
          await $fetch(`/api/transactions/${row.original.id}`, {
            method: 'DELETE'
          })

          refresh()

          toast.add({
            title: 'Item removido com sucesso',
            description: `ID: ${row.original.id}`,
            color: 'success'
          })
        } catch (error: any) {
          toast.add({
            title: 'Erro ao excluir o item',
            description: error?.data?.message || error.message,
            color: 'error'
          })
        }
      }
    }
  ]
}
