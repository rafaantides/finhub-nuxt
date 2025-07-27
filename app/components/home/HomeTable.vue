<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { Category } from '~/types/api'

const data = defineModel<any>('data', { required: true })
const props = defineProps<{
  categories: Category[]
}>()

const columns: TableColumn<{
  category: string
  expense: number
  expense_transactions: number
  spendingShare: number
  incomeImpact: number
  suggestedExpense: number
  remainingOrMissing: number
}>[] = [
  {
    accessorKey: 'category',
    header: () => 'Categoria',
    cell: ({ row }) => {
      const category = String(row.getValue('category'))
      const color = getCategoryColor(category, props.categories)
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
    accessorKey: 'expense_transactions',
    header: () => h('div', { class: 'text-center' }, 'Transações'),
    cell: ({ row }) =>
      h('div', { class: 'text-center' }, row.getValue('expense_transactions'))
  },
  {
    accessorKey: 'spendingShare',
    header: () => h('div', { class: 'text-center' }, 'Porcentagem'),
    cell: ({ row }) => {
      const spendingShare = Number(row.getValue('spendingShare'))
      return h('div', { class: 'text-center' }, `${spendingShare.toFixed(2)}%`)
    }
  },
  {
    accessorKey: 'incomeImpact',
    header: () => h('div', { class: 'text-center' }, 'Impacto na Receita'),
    cell: ({ row }) => {
      const category = String(row.getValue('category'))
      const suggested = Number(
        getCategorySuggestedPercentage(category, props.categories)
      )
      const incomeImpact = Number(row.getValue('incomeImpact'))

      let colorClass = 'text-gray-500'

      if (!isNaN(suggested) && suggested) {
        if (incomeImpact < suggested) {
          colorClass = 'text-green-500'
        } else if (incomeImpact === suggested) {
          colorClass = 'text-yellow-500'
        } else if (incomeImpact > suggested) {
          colorClass = 'text-red-500'
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
    accessorKey: 'suggestedExpense',
    header: () => h('div', { class: 'text-center' }, 'Gasto Sugerido'),
    cell: ({ row }) => {
      const suggested = Number(row.getValue('suggestedExpense'))
      return h('div', { class: 'text-center' }, `R$${suggested.toFixed(2)}`)
    }
  },
  {
    accessorKey: 'remainingOrMissing',
    header: () => h('div', { class: 'text-center' }, 'Diferença'),
    cell: ({ row }) => {
      const category = String(row.getValue('category'))
      const suggested = Number(
        getCategorySuggestedPercentage(category, props.categories)
      )
      const diff = Number(row.getValue('remainingOrMissing'))
      const prefix = diff > 0 ? '+' : ''

      let colorClass = 'text-gray-500'

      if (suggested) {
        if (diff > 0) {
          colorClass = 'text-green-500'
        } else {
          colorClass = 'text-red-500'
        }
      }

      return h(
        'div',
        { class: `text-center font-medium ${colorClass}` },
        `${prefix}R$${diff.toFixed(2)}`
      )
    }
  }
]
</script>

<template>
  <UTable
    :data="processCategories(data, props.categories)"
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
