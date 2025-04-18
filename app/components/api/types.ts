export interface TableState<> {
  data: Ref<unknown[]>
  total: Ref<number>
  status: Ref<any>
  columns: any[]
  pagination: Ref<{
    pageIndex: number
    pageSize: number
  }>
  currentPage: Ref<number>
  filters: {
    columnFilters: any
    columnVisibility: any
  }
  rowSelection: Ref<any>
  table: any
}
