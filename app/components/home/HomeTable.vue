<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Category } from '~/types/api'

const data = defineModel<any>('data', { required: true })
const props = defineProps<{
  categories: Category[]
}>()

const config = useRuntimeConfig()

function getCategoryColor(categoryName: string): string {
  const category = props.categories.find((cat) => cat.name === categoryName)
  return category?.color ?? config.public.uncategorizedColor
}

function getCategorySuggestedPercentage(categoryName: string): number | null {
  const category = props.categories.find((cat) => cat.name === categoryName)
  return category?.suggested_percentage ?? null
}

const columns: TableColumn<{
  category: string
  expense: number
  transactions: number
  average: number
  spendingShare: number
  // incomeImpact: number
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
    accessorKey: 'expense',
    header: () => h('div', { class: 'text-center' }, 'Total'),
    cell: ({ row }) => {
      const expense = Number(row.getValue('expense'))
      return h('div', { class: 'text-center' }, `R$${expense.toFixed(2)}`)
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
    accessorKey: 'incomeImpact',
    header: () => h('div', { class: 'text-center' }, 'Impacto na Receita'),
    cell: ({ row }) => {
      const category = String(row.getValue('category'))
      const suggested = Number(getCategorySuggestedPercentage(category))
      const incomeImpact = Number(row.getValue('incomeImpact'))

      let colorClass = 'text-gray-500' // valor padrão

      if (!isNaN(suggested) && suggested) {
        if (incomeImpact < suggested) {
          colorClass = 'text-green-500' // abaixo do limite
        } else if (incomeImpact === suggested) {
          colorClass = 'text-yellow-500' // exatamente o limite
        } else if (incomeImpact > suggested) {
          colorClass = 'text-red-500' // estourou o limite
        }
      }

      return h(
        'div',
        {
          class: `text-center font-medium ${colorClass}`,
          title:
            !isNaN(suggested) && suggested
              ? `Sugerido: ${suggested.toFixed(2)}%`
              : 'Sem sugestão definida'
        },
        `${incomeImpact.toFixed(2)}%`
      )
    }
  }
]

function processCategories(
  data: {
    date: string
    expense: number
    categories: {
      category: string
      expense: number
      transactions: number
    }[]
  }[]
) {
  const categoryMap = new Map<
    string,
    { expense: number; transactions: number }
  >()
  let expense = 0

  for (const week of data) {
    expense += week.expense

    for (const cat of week.categories) {
      const current = categoryMap.get(cat.category) || {
        expense: 0,
        transactions: 0
      }
      categoryMap.set(cat.category, {
        expense: current.expense + cat.expense,
        transactions: current.transactions + cat.transactions
      })
    }
  }

  const result = []
  for (const [category, values] of categoryMap.entries()) {
    const average =
      values.transactions > 0 ? values.expense / values.transactions : 0
    // const incomeImpact =
    //   totalIncome > 0 ? (values.total / totalIncome) * 100 : 0
    const spendingShare = expense > 0 ? (values.expense / expense) * 100 : 0
    result.push({
      category,
      expense: values.expense,
      transactions: values.transactions,
      average,
      spendingShare
      // incomeImpact
    })
  }

  // Ordenar por porcentagem decrescente
  return result.sort((a, b) => b.spendingShare - a.spendingShare)
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
