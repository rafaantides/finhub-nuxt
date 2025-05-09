<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { z } from 'zod'
import { useToast } from '#imports'
import type { FormSubmitEvent } from '#ui/types'
import type { Debt } from '~/types/api'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  debt: Debt | null
  invoiceId?: string
  categories: { label: string; value: string }[]
  statuses: { label: string; value: string }[]
  refresh: () => void
}>()

const schema = z.object({
  invoice_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  amount: z.number({
    required_error: 'Valor é obrigatório'
  }),
  purchase_date: z.coerce.date({
    required_error: 'Data de compra obrigatória'
  }),
  due_date: z.coerce.date().nullable(),
  category_id: z
    .string({
      required_error: 'Selecione uma categoria'
    })
    .uuid(),
  status_id: z
    .string({
      required_error: 'Selecione um status'
    })
    .uuid()
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  invoice_id: props.invoiceId ?? undefined,
  title: undefined,
  amount: undefined,
  purchase_date: undefined,
  due_date: undefined,
  category_id: undefined,
  status_id: undefined
})

watch(
  () => props.debt,
  (debt) => {
    if (debt) {
      state.invoice_id = debt.invoice?.id
      state.title = debt.title
      state.amount = debt.amount
      state.purchase_date = new Date(debt.purchase_date)
      state.due_date = debt.due_date ? new Date(debt.due_date) : undefined
      state.category_id = debt.category?.id
      state.status_id = debt.status?.id
    }
  },
  { immediate: true }
)

const purchaseDate = computed({
  get: () =>
    state.purchase_date
      ? state.purchase_date.toISOString().substring(0, 16)
      : '',
  set: (val: string) => {
    state.purchase_date = val ? new Date(val) : undefined
  }
})

const dueDate = computed({
  get: () => (state.due_date ? state.due_date.toISOString().split('T')[0] : ''),
  set: (val: string) => {
    state.due_date = val ? new Date(val) : undefined
  }
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const isEdit = Boolean(props.debt?.id)
  const url = isEdit ? `/api/debts/${props.debt!.id}` : '/api/debts'
  const method = isEdit ? 'PUT' : 'POST'

  try {
    const { data } = await $fetch<{ data: Debt }>(url, {
      method,
      body: event.data
    })

    toast.add({
      title: isEdit
        ? 'Débito atualizado com sucesso'
        : 'Débito criado com sucesso',
      description: `ID: ${data.id}`,
      color: 'success'
    })

    props.refresh()
  } catch (error: any) {
    toast.add({
      title: isEdit ? 'Erro ao atualizar o débito' : 'Erro ao criar o débito',
      description: error?.data?.message || error.message,
      color: 'error'
    })
  } finally {
    open.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="props.debt?.id ? `ID: ${props.debt.id}` : 'Novo Débito'"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Invoice ID" name="invoice_id">
          <UInput v-model="state.invoice_id" class="w-full" disabled />
        </UFormField>

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
          <UButton label="Salvar" color="primary" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
