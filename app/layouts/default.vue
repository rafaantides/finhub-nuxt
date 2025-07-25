<script setup lang="ts">
const route = useRoute()
const toast = useToast()

const open = ref(false)
const config = useRuntimeConfig()

const links = computed(() => [
  [
    {
      label: 'Home',
      icon: 'i-lucide-house',
      to: '/',
      onSelect: () => {
        open.value = false
      }
    },
    // {
    //   label: 'Inbox',
    //   icon: 'i-lucide-inbox',
    //   to: '/inbox',
    //   badge: '4',
    //   onSelect: () => {
    //     open.value = false
    //   }
    // },
    {
      label: 'Faturas',
      icon: 'i-lucide-wallet',
      to: '/invoices',
      active: route.path.startsWith('/invoices'),
      onSelect: () => {
        open.value = false
      }
    },
    {
      label: 'Transações',
      icon: 'i-lucide-credit-card',
      to: '/transactions',
      onSelect: () => {
        open.value = false
      }
    },
    // {
    //   label: 'Customers',
    //   icon: 'i-lucide-users',
    //   to: '/customers',
    //   onSelect: () => {
    //     open.value = false
    //   }
    // },
    {
      label: 'Settings',
      to: '/settings',
      icon: 'i-lucide-settings',
      defaultOpen: false,
      children: [
        {
          label: 'General',
          to: '/settings',
          exact: true,
          onSelect: () => {
            open.value = false
          }
        },
        {
          label: 'Members',
          to: '/settings/members',
          onSelect: () => {
            open.value = false
          }
        },
        {
          label: 'Notifications',
          to: '/settings/notifications',
          onSelect: () => {
            open.value = false
          }
        },
        {
          label: 'Security',
          to: '/settings/security',
          onSelect: () => {
            open.value = false
          }
        }
      ]
    }
  ],
  [
    {
      label: 'Linkedin',
      icon: 'i-lucide-message-circle',
      to: 'https://www.linkedin.com/in/rafaantides',
      target: '_blank'
    },
    {
      label: 'Documentação',
      icon: 'i-lucide-book-open',
      to: `${config.apiBaseUrl}/docs/v1`,
      target: '_blank'
    }
  ]
])

const groups = computed(() => [
  {
    id: 'links',
    label: 'Go to',
    items: links.value.flat()
  },
  {
    id: 'code',
    label: 'Code',
    items: [
      {
        id: 'source',
        label: 'View page source',
        icon: 'i-simple-icons-github',
        to: `https://github.com/nuxt-ui-pro/dashboard/blob/main/app/pages${
          route.path === '/' ? '/index' : route.path
        }.vue`,
        target: '_blank'
      }
    ]
  }
])

onMounted(async () => {
  const cookie = useCookie('cookie-consent')
  if (cookie.value === 'accepted') {
    return
  }

  toast.add({
    title:
      'We use first-party cookies to enhance your experience on our website.',
    duration: 0,
    close: false,
    actions: [
      {
        label: 'Accept',
        color: 'neutral',
        variant: 'outline',
        onClick: () => {
          cookie.value = 'accepted'
        }
      },
      {
        label: 'Opt out',
        color: 'neutral',
        variant: 'ghost'
      }
    ]
  })
})
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-(--ui-bg-elevated)/25"
      :ui="{ footer: 'lg:border-t lg:border-(--ui-border)' }"
    >
      <template #header="{ collapsed }">
        <TeamsMenu :collapsed="collapsed" />
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton
          :collapsed="collapsed"
          class="bg-transparent ring-(--ui-border)"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
        />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          class="mt-auto"
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />

    <NotificationsSlideover />
  </UDashboardGroup>
</template>
