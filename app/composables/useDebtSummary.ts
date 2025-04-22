import { ref, computed, watch } from 'vue'
import type { Period, Range } from '~/types'

type DataRecord = {
  date: Date
  amount: number
  [key: string]: Date | string | number
}

const data = ref<DataRecord[]>([])

export function useDebtSummary(period: Ref<Period>, range: Ref<Range>) {
  const fetchData = async () => {
    const { data: response } = await useFetch<{ data: DataRecord[] }>(
      '/api/debts/summary',
      {
        query: {
          period: period.value,
          start_date: range.value.start.toISOString(),
          end_date: range.value.end.toISOString()
        }
      }
    )

    data.value = response.value?.data || []
  }

  watch([period, range], fetchData, { immediate: true })

  const sumTotal = computed(() =>
    data.value.reduce((acc: number, item) => acc + (Number(item.total) || 0), 0)
  )

  const categories = [
    'total',
    'Assinaturas e Streaming',
    'Alimentação e Delivery',
    'Saúde e Bem-estar',
    'Compras e E-commerce',
    'Transporte',
    'Vestuario e Estética',
    'Mercado e Conveniência',
    'Cafés e Bares',
    'Eventos e Lazer'
  ]

  return {
    data,
    sumTotal,
    categories
  }
}
export function getCategoryColor(category: string): string {
  const root = document.documentElement
  const primaryColor = getComputedStyle(root)
    .getPropertyValue('--ui-primary')
    .trim()

  const categoryColorMap: Record<string, string> = {
    total: primaryColor,
    'Assinaturas e Streaming': '#FF6384',
    'Alimentação e Delivery': '#FF9F40',
    'Saúde e Bem-estar': '#4BC0C0',
    'Compras e E-commerce': '#9966FF',
    Transporte: '#36A2EB',
    'Vestuario e Estética': '#FFCE56',
    'Mercado e Conveniência': '#8AC24A',
    'Cafés e Bares': '#CD853F',
    'Eventos e Lazer': '#BA55D3'
  }

  return categoryColorMap[category] || '#CCCCCC'
}
