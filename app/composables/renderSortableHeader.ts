function renderSortableHeader(
  columnName: string,
  orderBy: { value: string | null },
  orderDirection: { value: string | null },
  pagination: { value: { pageIndex: number; pageSize: number } },
  refresh: () => void,
  column: { id: string }
) {
  const isSorted = orderBy.value === column.id // Verifica se a coluna está sendo ordenada
  const direction = isSorted ? orderDirection.value : undefined // Define a direção da ordenação

  return {
    color: 'neutral',
    variant: 'ghost',
    label: columnName,
    icon: isSorted
      ? direction === 'asc'
        ? 'i-lucide-arrow-up-narrow-wide'
        : 'i-lucide-arrow-down-wide-narrow'
      : 'i-lucide-arrow-up-down',
    class: '-mx-2.5',
    onClick: () => {
      const newDirection =
        isSorted && orderDirection.value === 'asc' ? 'desc' : 'asc'

      orderBy.value = column.id
      orderDirection.value = newDirection
      pagination.value.pageIndex = 0

      refresh()
    }
  }
}

export { renderSortableHeader }
