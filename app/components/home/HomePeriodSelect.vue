<script setup lang="ts">
import { eachDayOfInterval } from 'date-fns'
import type { Period, Range } from '~/types'

const model = defineModel<Period>({ required: true })

const props = defineProps<{
  range: Range
}>()

const days = computed(() => {
  if (!props.range.start || !props.range.end) return []
  return eachDayOfInterval({
    start: props.range.start,
    end: props.range.end
  })
})

// Mapeando períodos com label em PT e value em EN
const periodOptions = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal'
}

const periods = computed(() => {
  let values: Period[] = []
  if (days.value.length <= 8) {
    values = ['daily']
  } else if (days.value.length <= 31) {
    values = ['daily', 'weekly']
  } else if (days.value.length <= 69) {
    values = ['daily', 'weekly', 'monthly']
  } else {
    values = ['weekly', 'monthly']
  }

  // Retorna array de objetos { label, value }
  return values.map((value) => ({
    label: periodOptions[value],
    value
  }))
})

// Garante que model.value seja válido
watch(periods, () => {
  if (!periods.value.some((p) => p.value === model.value)) {
    model.value = periods.value[0]!.value
  }
})
</script>

<template>
  <USelect
    v-model="model"
    :items="periods"
    item-label="label"
    item-value="value"
    variant="ghost"
    class="data-[state=open]:bg-(--ui-bg-elevated)"
    :ui="{
      value: 'capitalize',
      itemLabel: 'capitalize',
      trailingIcon:
        'group-data-[state=open]:rotate-180 transition-transform duration-200'
    }"
  />
</template>
