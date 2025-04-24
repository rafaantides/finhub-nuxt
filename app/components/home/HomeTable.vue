<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Category } from '~/types/api'

const data = defineModel<any>('data', { required: true })
const props = defineProps<{
  categories: Category[]
}>()

function getCategoryColor(categoryName: string): string {
  const category = props.categories.find((cat) => cat.name === categoryName)
  return category?.color ?? '#CBD5E1' // cor padrão (cinza claro do Tailwind, caso não encontre)
}
const columns: TableColumn<{
  category: string
  total: number
  transactions: number
  average: number
  percentage: number
}>[] = [
  {
    accessorKey: 'category',
    header: () => 'Categoria',
    cell: ({ row }) => {
      const category = String(row.getValue('category'))
      const color = getCategoryColor(category)
      return h('div', { class: 'flex items-center' }, [
        h('div', {
          class: 'w-3 h-2.5 mr-2 rounded-sm',
          style: {
            backgroundColor: `${color}50`,
            borderColor: color,
            color: color,
            borderWidth: '1px'
          }
        }),
        category
      ])
    }
  },
  {
    accessorKey: 'transactions',
    header: () => h('div', { class: 'text-center' }, 'Transações'),
    cell: ({ row }) =>
      h('div', { class: 'text-center' }, row.getValue('transactions'))
  },
  {
    accessorKey: 'total',
    header: () => h('div', { class: 'text-center' }, 'Total'),
    cell: ({ row }) => {
      const total = Number(row.getValue('total'))
      return h('div', { class: 'text-center' }, `R$${total.toFixed(2)}`)
    }
  },
  {
    accessorKey: 'average',
    header: () => h('div', { class: 'text-center' }, 'Média'),
    cell: ({ row }) => {
      const average = Number(row.getValue('average'))
      return h('div', { class: 'text-center' }, `R$${average.toFixed(2)}`)
    }
  },
  {
    accessorKey: 'percentage',
    header: () => h('div', { class: 'text-center' }, 'Porcentagem'),
    cell: ({ row }) => {
      const percentage = Number(row.getValue('percentage'))
      return h('div', { class: 'text-center' }, `${percentage.toFixed(2)}%`)
    }
  }
]

function processCategories(
  data: {
    date: string
    total: number
    categories: {
      category: string
      total: number
      transactions: number
    }[]
  }[]
) {
  const categoryMap = new Map<string, { total: number; transactions: number }>()
  let totalGeral = 0

  for (const week of data) {
    totalGeral += week.total

    for (const cat of week.categories) {
      const current = categoryMap.get(cat.category) || {
        total: 0,
        transactions: 0
      }
      categoryMap.set(cat.category, {
        total: current.total + cat.total,
        transactions: current.transactions + cat.transactions
      })
    }
  }

  const result = []
  for (const [category, values] of categoryMap.entries()) {
    const average =
      values.transactions > 0 ? values.total / values.transactions : 0
    const percentage = totalGeral > 0 ? (values.total / totalGeral) * 100 : 0
    result.push({
      category,
      total: values.total,
      transactions: values.transactions,
      average,
      percentage
    })
  }

  // Ordenar por porcentagem decrescente
  return result.sort((a, b) => b.percentage - a.percentage)
}
</script>

<template>
  <UTable
    :data="processCategories(data)"
    :columns="columns"
    class="shrink-0"
    :ui="{
      base: 'table-fixed border-separate border-spacing-0',
      thead: '[&>tr]:bg-(--ui-bg-elevated)/50 [&>tr]:after:content-none',
      tbody: '[&>tr]:last:[&>td]:border-b-0',
      th: 'py-1 first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] border-y border-(--ui-border) first:border-l last:border-r',
      td: 'border-b border-(--ui-border)'
    }"
  />
</template>
