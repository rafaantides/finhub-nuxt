<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { z } from 'zod'
import { useToast } from '#imports'
import type { FormSubmitEvent } from '#ui/types'
import type { Invoice } from '~/types/api'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  invoice: Invoice | null
  statuses: { label: string; value: string }[]
  refresh: () => void
}>()

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  amount: z.number(),
  due_date: z.coerce.date({
    required_error: 'Data de vencimento obrigatória'
  }),
  issue_date: z.coerce.date().nullable(),
  status_id: z
    .string({
      required_error: 'Selecione um status'
    })
    .uuid('Status inválido')
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  title: undefined,
  amount: undefined,
  issue_date: undefined,
  due_date: undefined,
  status_id: undefined
})

watch(
  () => props.invoice,
  (invoice) => {
    if (invoice) {
      state.title = invoice.title
      state.amount = invoice.amount
      state.due_date = new Date(invoice.due_date)
      state.issue_date = invoice.issue_date
        ? new Date(invoice.issue_date)
        : null
      state.status_id = invoice.status?.id
    }
  },
  { immediate: true }
)

const issueDate = computed({
  get: () =>
    state.issue_date ? state.issue_date.toISOString().substring(0, 16) : '',
  set: (val: string) => {
    state.issue_date = val ? new Date(val) : null
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
  const isEdit = Boolean(props.invoice?.id)
  const url = isEdit ? `/api/invoices/${props.invoice!.id}` : '/api/invoices'
  const method = isEdit ? 'PUT' : 'POST'

  try {
    const { data } = await $fetch<{ data: Invoice }>(url, {
      method,
      body: event.data
    })

    toast.add({
      title: isEdit
        ? 'Fatura atualizada com sucesso'
        : 'Fatura criada com sucesso',
      description: `ID: ${data.id}`,
      color: 'success'
    })

    props.refresh()
  } catch (error: any) {
    toast.add({
      title: isEdit ? 'Erro ao atualizar a fatura' : 'Erro ao criar a fatura',
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
    :title="props.invoice?.id ? `ID: ${props.invoice.id}` : 'Nova Fatura'"
  >
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

        <UFormField label="Data de vencimento" name="due_date">
          <UInput v-model="dueDate" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Data da emissão" name="issue_date">
          <UInput v-model="issueDate" type="datetime-local" class="w-full" />
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
