<script setup lang="ts">
import { upperFirst } from 'scule'
import { format } from 'date-fns'
import {
  VisXYContainer,
  VisLine,
  VisAxis,
  VisArea,
  VisCrosshair,
  VisTooltip
} from '@unovis/vue'
import type { Period, DataRecord } from '~/types'
import type { Category } from '~/types/api'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')
const period = defineModel<Period>('period', { required: true })

const props = defineProps<{
  categories: Category[]
}>()

const data = defineModel<any>('data', { required: true })

const chartData = computed(() => {
  return data.value.map((entry: any) => {
    const obj: Record<string, number | Date> = {
      date: new Date(entry.date),
      'Gasto Total': entry.expense
    }

    entry.categories.forEach((cat: any) => {
      obj[cat.category] = cat.expense
    })

    return obj
  })
})

const { width } = useElementSize(cardRef)

const formatDate = (date: Date): string => {
  return {
    daily: format(date, 'd MMM'),
    weekly: format(date, 'd MMM'),
    monthly: format(date, 'MMM yyy')
  }[period.value]
}

const x = (_: DataRecord, i: number) => i
const y = (category: string) => (d: DataRecord) => {
  return d[category] as number
}

const yTicks = (value: number) => formatNumber(value)

const xTicks = (i: number) => {
  if (i === 0 || i === data.value.length - 1 || !data.value[i]) {
    return ''
  }
  return formatDate(data.value[i].date)
}

const formatNumber = new Intl.NumberFormat('en', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
}).format

const tooltip = (d: DataRecord) => {
  let tooltip = `<div class="text-sm font-semibold">${formatDate(d.date)}</div>`

  const categoryValues = props.categories.map((category) => ({
    category,
    value: Number(d[category.name])
  }))

  categoryValues.sort((a, b) => b.value - a.value)

  categoryValues.forEach(({ category, value }) => {
    tooltip += `<div class="flex items-center mt-1">
    <div class="w-3 h-2.5 mr-2 rounded-sm" style="background-color: ${
      category.color
    }50; border-color: ${category.color}; color: ${
      category.color
    }; border-width: 1px;"></div>
    <span>${upperFirst(category.name)}: R${formatNumber(value)}</span>
  </div>`
  })

  return tooltip
}
</script>

<template>
  <UCard ref="cardRef" :ui="{ body: '!px-0 !pt-0 !pb-3' }">
    <VisXYContainer
      :data="chartData"
      :padding="{ top: 40 }"
      class="h-96"
      :width="width"
    >
      <template v-for="category in categories" :key="category.id">
        <VisLine
          :x="x"
          :y="y(category.name)"
          :color="category.color"
          :stroke-width="category.id === 'expense' ? 2 : 1"
          :stroke-dasharray="0"
        />
        <VisArea
          :x="x"
          :y="y(category.name)"
          :color="category.color"
          :opacity="0.1"
        />
      </template>

      <VisAxis type="x" :x="x" :tick-format="xTicks" />
      <VisAxis type="y" :y="y" :tick-format="yTicks" />

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
