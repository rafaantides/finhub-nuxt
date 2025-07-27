<script setup lang="ts">
const data = defineModel<any>('data', { required: true })

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2
  })
}

const stats = computed(() => [
  {
    title: 'Entradas',
    icon: 'i-lucide-arrow-down-circle',
    value: formatCurrency(data.value?.income ?? 0),
    isNegative: false
  },
  {
    title: 'Saídas',
    icon: 'i-lucide-arrow-up-circle',
    value: formatCurrency(data.value?.expense ?? 0),
    isNegative: false
  },
  {
    title: 'Taxas',
    icon: 'i-lucide-arrow-up-circle',
    value: formatCurrency(data.value?.tax ?? 0),
    isNegative: false
  },
  // {
  //   title: 'Compras',
  //   icon: 'i-lucide-shopping-cart',
  //   value: data.value?.expense_transactions ?? 0,
  //   isNegative: false
  // },
  {
    title: 'Saldo',
    icon: 'i-lucide-circle-dollar-sign',
    value: formatCurrency(data.value?.balance ?? 0),
    isNegative: (data.value?.balance ?? 0) < 0
  }
])
</script>

<template>
  <UPageGrid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <UPageCard
      v-for="(stat, index) in stats"
      :key="index"
      :icon="stat.icon"
      :title="stat.title"
      variant="subtle"
      :ui="{
        container: 'gap-y-1.5',
        leading:
          'p-2.5 rounded-full bg-(--ui-primary)/10 ring ring-inset ring-(--ui-primary)/25',
        title: 'font-normal text-(--ui-text-muted) text-xs uppercase'
      }"
      class="lg:rounded-none first:rounded-l-[calc(var(--ui-radius)*2)] last:rounded-r-[calc(var(--ui-radius)*2)] hover:z-1"
    >
      <div class="flex items-center gap-2">
        <span
          class="text-2xl font-semibold"
          :class="
            stat.isNegative ? 'text-red-500' : 'text-(--ui-text-highlighted)'
          "
        >
          {{ stat.value }}
        </span>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
