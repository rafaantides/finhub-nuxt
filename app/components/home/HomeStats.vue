<script setup lang="ts">
const data = defineModel<any>('data', { required: true })

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  })
}

function formatDecimal(value: number): string {
  return value.toFixed(2).replace('.', ',')
}

const stats = computed(() => [
  {
    title: 'Valor Total',
    icon: 'i-lucide-circle-dollar-sign',
    value: formatCurrency(data.value?.total_amount ?? 0)
  },
  {
    title: 'Compras',
    icon: 'i-lucide-shopping-cart',
    value: data.value?.total_transactions ?? 0
  },
  {
    title: 'Estabelecimentos',
    icon: 'i-lucide-building-2',
    value: data.value?.unique_establishments ?? 0
  },
  {
    title: 'Média por Compra',
    icon: 'i-lucide-divide',
    value: formatDecimal(data.value?.average_per_transaction ?? 0)
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
        <span class="text-2xl font-semibold text-(--ui-text-highlighted)">
          {{ stat.value }}
        </span>
      </div>
    </UPageCard>
  </UPageGrid>
</template>
