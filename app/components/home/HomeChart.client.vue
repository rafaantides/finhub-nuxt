<script setup lang="ts">
import { format } from 'date-fns'
import { upperFirst } from 'scule'
import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisArea,
  VisCrosshair,
  VisTooltip
} from '@unovis/vue'
import type { Period, Range } from '~/types'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')

const props = defineProps<{
  period: Period
  range: Range
}>()

type DataRecord = {
  date: Date
  amount: number
  [key: string]: Date | string | number
}

const { width } = useElementSize(cardRef)

const data = ref<DataRecord[]>([])

const fetchData = async () => {
  const { data: response } = await useFetch<{ data: DataRecord[] }>(
    '/api/debts/summary',
    {
      query: {
        period: props.period,
        start_date: new Date(props.range.start).toISOString(),
        end_date: new Date(props.range.end).toISOString()
      }
    }
  )

  data.value = response.value?.data || []
}

watch([() => props.range, () => props.period], fetchData, { immediate: true })

const x = (_: DataRecord, i: number) => i
const y = (category: string) => (d: DataRecord) => {
  return d[category] as number
}

const sumTotal = computed(() =>
  data.value.reduce((acc: number, item) => acc + (Number(item.total) || 0), 0)
)

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

const formatNumber = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format

const formatDate = (date: Date): string => {
  return {
    daily: format(date, 'd MMM'),
    weekly: format(date, 'd MMM'),
    monthly: format(date, 'MMM yyy')
  }[props.period]
}

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return ''
  }

  return formatDate(data.value[i].date)
}

const categories = computed(() => {
  const allCategories = new Set<string>([])
  data.value.forEach((item) => {
    Object.keys(item).forEach((key) => {
      if (key !== 'date') {
        allCategories.add(key)
      }
    })
  })

  return Array.from(allCategories)
})

const tooltip = (d: DataRecord) => {
  let tooltip = `<div class="text-sm font-semibold">${formatDate(d.date)}</div>`

  const categoryValues = categories.value
    .filter((category) => d[category] != null)
    .map((category) => ({
      category,
      value: Number(d[category])
    }))
    .sort((a, b) => {
      return b.value - a.value
    })

  categoryValues.forEach(({ category, value }) => {
    tooltip += `<div class="flex items-center mt-1">
      <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${
        categoryColorMap[category] ?? '#FFFFFF'
      }"></div>
      <span>${upperFirst(category)}: ${formatNumber(value)}</span>
    </div>`
  })

  return tooltip
}
</script>

<template>
  <UCard ref="cardRef" :ui="{ body: '!px-0 !pt-0 !pb-3' }">
    <template #header>
      <div>
        <p class="text-xs text-(--ui-text-muted) uppercase mb-1.5">Revenue</p>
        <p class="text-3xl text-(--ui-text-highlighted) font-semibold">
          {{ formatNumber(sumTotal) }}
        </p>
      </div>
    </template>

    <VisXYContainer
      :data="data"
      :padding="{ top: 40 }"
      class="h-96"
      :width="width"
    >
      <template v-for="category in categories" :key="category">
        <VisLine
          :x="x"
          :y="y(category)"
          :color="categoryColorMap[category] ?? '#FFFFFF'"
          :stroke-width="category === 'total' ? 2 : 1"
          :stroke-dasharray="0"
        />
        <VisArea
          :x="x"
          :y="y(category)"
          :color="categoryColorMap[category] ?? '#FFFFFF'"
          :opacity="0.1"
        />
      </template>
      <VisArea :x="x" :y="y" color="var(--ui-primary)" :opacity="0.1" />

      <VisAxis type="x" :x="x" :tick-format="xTicks" />

      <VisCrosshair color="var(--ui-primary)" :template="tooltip" />

      <VisTooltip />
    </VisXYContainer>
  </UCard>
</template>

<style scoped>
.unovis-xy-container {
  --vis-crosshair-line-stroke-color: var(--ui-primary);
  --vis-crosshair-circle-stroke-color: var(--ui-bg);

  --vis-axis-grid-color: var(--ui-border);
  --vis-axis-tick-color: var(--ui-border);
  --vis-axis-tick-label-color: var(--ui-text-dimmed);

  --vis-tooltip-background-color: var(--ui-bg);
  --vis-tooltip-border-color: var(--ui-border);
  --vis-tooltip-text-color: var(--ui-text-highlighted);
}
</style>
