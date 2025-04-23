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
import { getCategoryColor } from '~/composables/useDebtSummary'

const cardRef = useTemplateRef<HTMLElement | null>('cardRef')
const period = defineModel<Period>('period', { required: true })

const data = defineModel<any>('data', { required: true })
const categories = defineModel<string[]>('categories', { required: true })

const chartData = computed(() => {
  return data.value.map((entry: any) => {
    const obj: Record<string, number | Date> = {
      date: new Date(entry.date),
      total: entry.total
    }

    entry.categories.forEach((cat: any) => {
      obj[cat.category] = cat.total
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

// TODO: esta sempre um dia atras doq vem do back
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

  const categoryValues = categories.value
    .filter((category) => d[category] != null)
    .map((category) => ({
      category,
      value: Number(d[category])
    }))
    .sort((a, b) => b.value - a.value)

  categoryValues.forEach(({ category, value }) => {
    const color = getCategoryColor(category)
    tooltip += `<div class="flex items-center mt-1">
      <div class="w-3 h-2.5 mr-2 rounded-sm" style="background-color: ${color}50; border-color: ${color}; color: ${color}; border-width: 1px;"></div>
      <span>${upperFirst(category)}: ${formatNumber(value)}</span>
    </div>`
  })

  return tooltip
}
</script>

<template>
  <UCard ref="cardRef" :ui="{ body: '!px-0 !pt-0 !pb-3' }">
    <!-- <template #header>
      <div>
        <p class="text-xs text-(--ui-text-muted) uppercase mb-1.5">Resumo por Categoria</p>
        <p class="text-3xl text-(--ui-text-highlighted) font-semibold">
          {{ formatNumber(sumTotal) }}
        </p>
      </div>
    </template> -->

    <VisXYContainer
      :data="chartData"
      :padding="{ top: 40 }"
      class="h-96"
      :width="width"
    >
      <template v-for="category in categories" :key="category">
        <VisLine
          :x="x"
          :y="y(category)"
          :color="getCategoryColor(category)"
          :stroke-width="category === 'total' ? 2 : 1"
          :stroke-dasharray="0"
        />
        <VisArea
          :x="x"
          :y="y(category)"
          :color="getCategoryColor(category)"
          :opacity="0.1"
        />
      </template>

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
