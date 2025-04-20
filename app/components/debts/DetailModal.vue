<script setup lang="ts">
import * as z from 'zod'
import type { ApiResponse, Debt, Category, PaymentStatus } from '~/types/api'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  debt: Debt | null
}>()

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  amount: z.number().min(0, 'O valor deve ser positivo'),
  purchase_date: z.coerce.date({
    required_error: 'Data de compra obrigatória'
  }),
  due_date: z.coerce.date().optional(),
  category_id: z.string().uuid().optional(),
  status_id: z.string().uuid().optional()
})

type Schema = z.output<typeof schema>

const { data: categoryData } = useFetch<ApiResponse<Category[]>>(
  '/api/categories',
  {
    query: { page_size: 100 },
    lazy: true
  }
)

const { data: statusesData } = useFetch<ApiResponse<PaymentStatus[]>>(
  '/api/paymentstatus',
  {
    query: { page_size: 100 },
    lazy: true
  }
)

const categories = computed(() => toSelectOptions(categoryData.value?.data))
const statuses = computed(() => toSelectOptions(statusesData.value?.data))

const state = reactive<Partial<Schema>>({
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

// const toast = useToast()
// async function onSubmit(event: FormSubmitEvent<Schema>) {
//   const updated = {
//     ...(props.debt || {}),
//     ...event.data
//   }

//   emit('save', updated)

//   toast.add({
//     title: 'Débito atualizado com sucesso',
//     description: `Título: ${updated.title}`,
//     color: 'success'
//   })

//   emit('update:open', false)
// }
</script>

<template>
  <UModal v-model:open="open" title="Editar Débito">
    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4">
        <UFormField label="Título" name="title">
          <UInput v-model="state.title" class="w-full" />
        </UFormField>

        <UFormField label="Valor" name="amount">
          <UInput v-model="state.amount" type="number" class="w-full" />
        </UFormField>

        <UFormField label="Data da compra" name="purchase_date">
          <UInput v-model="purchaseDate" type="datetime-local" class="w-full" />
        </UFormField>

        <UFormField label="Data de vencimento" name="due_date">
          <UInput v-model="dueDate" type="date" class="w-full" />
        </UFormField>

        <UFormField label="Categoria" name="category_id">
          <USelect
            v-model="state.category_id"
            :items="categories"
            placeholder="Selecione uma categoria"
            class="w-full"
          />
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
