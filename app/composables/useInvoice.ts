import type { Row } from '@tanstack/table-core'
import type { Invoice } from '~/types/api'
import type { ColumnConfig } from '~/types/table'

export const invoiceColumnsConfig: ColumnConfig[] = [
  // { key: 'id', label: 'ID', sortable: true },
  {
    key: 'due_date',
    label: 'Data de Vencimento',
    sortable: true,
    type: 'date'
  },
  { key: 'title', label: 'Título', sortable: true },
  { key: 'amount', label: 'Valor', sortable: true, type: 'currency' },
  { key: 'status', label: 'Status', sortable: true, type: 'status' }
]

export function getInvoiceRowItems(
  row: Row<Invoice>,
  showDetails: (invoice: Invoice) => void,
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
      label: 'Ver débitos',
      icon: 'i-lucide-credit-card',
      to: `/invoices/${row.original.id}/debts`
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
          await $fetch(`/api/invoices/${row.original.id}`, {
            method: 'DELETE'
          })

          refresh()

          toast.add({
            title: 'Fatura removida com sucesso',
            description: `ID: ${row.original.id}`,
            color: 'success'
          })
        } catch (error: any) {
          toast.add({
            title: 'Erro ao excluir a fatura',
            description: error?.data?.message || error.message,
            color: 'error'
          })
        }
      }
    }
  ]
}
