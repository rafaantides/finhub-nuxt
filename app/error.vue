<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusMessage = (
  props.error.statusMessage?.split(':')[0] ?? 'Error occurred'
).trim()

let details = 'An error occurred'

try {
  const data =
    typeof props.error.data === 'string'
      ? JSON.parse(props.error.data)
      : props.error.data

  if (data?.path) {
    details = data.path
  } else if (typeof data === 'string') {
    details = data
  } else if (typeof data === 'object') {
    details = JSON.stringify(data)
  }
} catch {
  // Se der erro no JSON.parse, assume string simples
  details = String(props.error.data || 'An error occurred')
}

const statusCode = props.error.statusCode || 500

useSeoMeta({
  title: `${statusCode} - ${statusMessage}`,
  description: details
})

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})
</script>

<template>
  <UApp>
    <UError
      :error="{
        statusCode,
        statusMessage,
        message: details
      }"
    />
  </UApp>
</template>
