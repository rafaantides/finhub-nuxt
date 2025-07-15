<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { z } from 'zod'
import { useToast } from '#imports'
import type { FormSubmitEvent } from '#ui/types'
import type { Transaction } from '~/types/api'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  transaction: Transaction | null
  categories: { label: string; value: string }[]
  statuses: { label: string; value: string }[]
  recordTypes: { label: string; value: string }[]
  refresh: () => void
}>()

const schema = z.object({
  invoice_id: z.string().uuid().optional(),
  title: z.string().min(1, 'Título é obrigatório'),
  amount: z.number({
    required_error: 'Valor é obrigatório'
  }),
  record_date: z.coerce.date({
    required_error: 'Data é obrigatória'
  }),
  category_id: z
    .string({
      required_error: 'Selecione uma categoria'
    })
    .uuid(),
  status: z.string({
    required_error: 'Selecione um status'
  }),
  record_type: z.string({
    required_error: 'Selecione um tipo'
  })
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  title: undefined,
  amount: undefined,
  record_date: undefined,
  category_id: undefined,
  status: undefined,
  record_type: undefined
})

watch(
  () => props.transaction,
  (transaction) => {
    if (transaction) {
      state.title = transaction.title
      state.amount = transaction.amount
      state.record_date = new Date(transaction.record_date)
      state.category_id = transaction.category?.id
      state.status = transaction.status
      state.record_type = transaction.record_type
    }
  },
  { immediate: true }
)

const recordDate = computed({
  get: () =>
    state.record_date ? state.record_date.toISOString().substring(0, 16) : '',
  set: (val: string) => {
    state.record_date = val ? new Date(val) : undefined
  }
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  const isEdit = Boolean(props.transaction?.id)
  const url = isEdit
    ? `/api/transactions/${props.transaction!.id}`
    : '/api/transactions'
  const method = isEdit ? 'PUT' : 'POST'

  try {
    const { data } = await $fetch<{ data: Transaction }>(url, {
      method,
      body: event.data
    })

    toast.add({
      title: isEdit ? 'Item atualizado com sucesso' : 'Item criado com sucesso',
      description: `ID: ${data.id}`,
      color: 'success'
    })

    props.refresh()
  } catch (error: any) {
    toast.add({
      title: isEdit ? 'Erro ao atualizar o item' : 'Erro ao criar o item',
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
    :title="props.transaction?.id ? `ID: ${props.transaction.id}` : 'Novo Item'"
  >
    <template #body>
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField label="Data" name="record_date">
          <UInput v-model="recordDate" type="datetime-local" class="w-full" />
        </UFormField>

        <UFormField label="Tipo" name="record_type">
          <USelect
            v-model="state.record_type"
            :items="recordTypes"
            placeholder="Selecione um tipo"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Título" name="title">
          <UInput v-model="state.title" class="w-full" />
        </UFormField>

        <UFormField label="Valor" name="amount">
          <UInput v-model="state.amount" type="number" class="w-full" />
        </UFormField>

        <UFormField label="Categoria" name="category_id">
          <USelect
            v-model="state.category_id"
            :items="categories"
            placeholder="Selecione uma categoria"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Status" name="status">
          <USelect
            v-model="state.status"
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
