<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Debt } from '~/types/api'

const props = defineProps<{
  categories: { label: string; value: string }[]
  statuses: { label: string; value: string }[]
  refresh: () => void
}>()

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  purchase_date: z.coerce.date({
    required_error: 'Purchase date is required'
  }),
  due_date: z.coerce.date().optional(),
  invoice_id: z.string().uuid('Invalid invoice ID').optional(),
  category_id: z.string().uuid('Invalid category ID').optional(),
  status_id: z.string().uuid('Invalid status ID').optional()
})
const open = ref(false)

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  title: undefined,
  amount: undefined,
  purchase_date: undefined,
  due_date: undefined,
  invoice_id: undefined,
  category_id: undefined,
  status_id: undefined
})

const purchaseDate = computed({
  get: () =>
    state.purchase_date
      ? state.purchase_date.toISOString().substring(0, 16) // Formato yyyy-mm-ddThh:mm
      : '',
  set: (value: string) => {
    state.purchase_date = value ? new Date(value) : undefined
  }
})

const dueDate = computed({
  get: () => (state.due_date ? state.due_date.toISOString().split('T')[0] : ''),
  set: (value: string) => {
    state.due_date = value ? new Date(value) : undefined
  }
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    const { data } = await $fetch<{ data: Debt }>(`/api/debts`, {
      method: 'POST',
      body: event.data
    })

    toast.add({
      title: 'Débito criado com sucesso',
      description: `ID: ${data.id}`,
      color: 'success'
    })

    props.refresh()
  } catch (error: any) {
    toast.add({
      title: 'Erro ao criar o débito',
      description: error?.data?.message || error.message,
      color: 'error'
    })
  }
  open.value = false
}
</script>

<template>
  <UModal v-model:open="open" title="Novo Débito">
    <UButton label="Adicionar Débito" icon="i-lucide-plus" />

    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Título" name="title">
          <UInput v-model="state.title" class="w-full" />
        </UFormField>

        <UFormField label="Valor" name="amount">
          <UInput v-model="state.amount" type="number" class="w-full" />
        </UFormField>

        <UFormField label="Data da compra" name="purchase_date">
          <UInput v-model="purchaseDate" type="datetime-local" class="w-full" />
        </UFormField>

        <UFormField label="Categoria" name="category_id">
          <USelect
            v-model="state.category_id"
            :items="categories"
            placeholder="Selecione uma categoria"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Data de vencimento" name="due_date">
          <UInput v-model="dueDate" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Status" name="status_id">
          <USelect
            v-model="state.status_id"
            :items="statuses"
            placeholder="Selecione um status"
            class="w-full"
          />
        </UFormField>

        <div class="flex justify-end gap-2">
          <UButton
            label="Cancelar"
            color="neutral"
            variant="subtle"
            @click="open = false"
          />
          <UButton
            label="Salvar"
            color="primary"
            variant="solid"
            type="submit"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
