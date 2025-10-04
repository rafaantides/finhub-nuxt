<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'auth',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/'
  }
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue'
})

const toast = useToast()
const isLoading = ref(false)

// Campos atualizados para usar "identifier"
const fields = [
  {
    name: 'identifier',
    type: 'text' as const,
    label: 'Email or Username',
    placeholder: 'Enter your email or username',
    required: true
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password',
    required: true
  }
]

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
      toast.add({ title: 'Google', description: 'Login with Google' })
    }
  }
]

// Schema de validação atualizado
const schema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required')
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    isLoading.value = true

    // Chama a API de login
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        identifier: event.data.identifier,
        password: event.data.password
      }
    })

    toast.add({
      title: 'Success!',
      description: 'Welcome back!'
    })

    // Redireciona para página inicial
    await navigateTo('/')
  } catch (error: any) {
    console.error('Login error:', error)

    // Usa a mensagem de erro do backend
    const errorMessage =
      error.data?.message || 'Login failed. Please try again.'

    toast.add({
      title: 'Login failed',
      description: errorMessage
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="schema"
    :providers="providers"
    :loading="isLoading"
    title="Welcome back"
    icon="i-lucide-lock"
    @submit="onSubmit"
  >
    <template #description>
      Don't have an account?
      <ULink to="/signup" class="text-primary font-medium">Sign up</ULink>.
    </template>

    <template #password-hint>
      <ULink
        to="/forgot-password"
        class="text-primary font-medium"
        tabindex="-1"
      >
        Forgot password?
      </ULink>
    </template>
  </UAuthForm>
</template>
