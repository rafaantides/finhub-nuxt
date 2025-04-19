export interface ColumnConfig {
  key: string
  label: string
  sortable?: boolean
  type?: 'date' | 'currency' | 'status'
  nestedKey?: string
}
