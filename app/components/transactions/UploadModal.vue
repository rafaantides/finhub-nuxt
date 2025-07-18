<script setup lang="ts">
const fileRef = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const toast = useToast()

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  invoiceId: string | null
  refresh: () => void
}>()

const action = ref('create')
const model = ref('nubank')
const models = [
  {
    label: 'Nubank',
    value: 'nubank'
  }
]

const actions = [
  {
    label: 'Inserir',
    value: 'create'
  }
]

async function onSubmit() {
  if (!selectedFile.value || !model.value) {
    toast.add({
      title: 'Erro',
      description: 'Preencha todos os campos e selecione um arquivo.',
      icon: 'i-lucide-alert-triangle',
      color: 'error'
    })
    return
  }

  const formData = new FormData()

  if (props.invoiceId && props.invoiceId !== '') {
    formData.append('invoice_id', props.invoiceId)
  }

  formData.append('model', model.value)
  formData.append('action', action.value)
  formData.append('file', selectedFile.value)

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    // Resetar os campos
    model.value = 'nubank'
    action.value = 'create'
    selectedFile.value = null

    if (response.ok) {
      toast.add({
        title: 'Sucesso',
        description: 'Arquivo enviado com sucesso.',
        icon: 'i-lucide-check',
        color: 'success'
      })
    } else {
      toast.add({
        title: 'Erro',
        description: 'Erro ao enviar o arquivo.',
        icon: 'i-lucide-x',
        color: 'error'
      })
    }
  } catch (error: any) {
    console.log(error)
    toast.add({
      title: 'Erro',
      description: 'Erro ao enviar o arquivo.',
      icon: 'i-lucide-x',
      color: 'error'
    })
  } finally {
    open.value = false
  }
}

function onFileClick() {
  fileRef.value?.click()
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
  }
}
</script>

<template>
  <UModal v-model:open="open" :title="'Importação'">
    <template #body>
      <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
        <UPageCard variant="subtle" :ui="{ body: 'flex flex-col gap-6' }">
          <UFormField
            name="file"
            label="Arquivo"
            required
            class="flex max-sm:flex-col justify-between sm:items-center gap-4"
          >
            <div class="flex flex-wrap items-center gap-3">
              <UButton
                label="Selecionar Arquivo"
                color="neutral"
                @click="onFileClick"
              />
              <span v-if="selectedFile">{{ selectedFile.name }}</span>
              <input
                ref="fileRef"
                type="file"
                class="hidden"
                @change="onFileChange"
              />
            </div>
          </UFormField>
        </UPageCard>

        <UPageCard variant="subtle" :ui="{ body: 'flex flex-col gap-6' }">
          <UFormField
            name="action"
            label="Ação"
            class="flex max-sm:flex-col justify-between items-start gap-4"
          >
            <USelect v-model="action" :items="actions" class="min-w-48" />
          </UFormField>

          <USeparator />

          <UFormField
            name="model"
            label="Modelo"
            class="flex max-sm:flex-col justify-between items-start gap-4"
          >
            <USelect v-model="model" :items="models" class="min-w-48" />
          </UFormField>
        </UPageCard>

        <UPageCard
          title="Enviar Arquivo"
          variant="subtle"
          orientation="horizontal"
          :ui="{ body: 'flex flex-col gap-6' }"
        >
          <!-- TODO: usar um icone ou um UBadge -->
          <UButton
            label="Enviar"
            color="primary"
            type="submit"
            class="w-fit lg:ms-auto"
            icone="i-lucide-rocket"
          />
        </UPageCard>
      </form>
    </template>
  </UModal>
</template>
