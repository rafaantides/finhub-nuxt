<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

const teams = ref([
  {
    label: '#003',
    avatar: {
      src: '/pokemon/venusaur.png',
      alt: 'Venusaur'
    }
  },
  {
    label: '#002',
    avatar: {
      src: '/pokemon/ivysaur.png',
      alt: 'Ivysaur'
    }
  },
  {
    label: '#001',
    avatar: {
      src: '/pokemon/bulbasaur.png',
      alt: 'Bulbasaur'
    }
  }
])
const selectedTeam = ref(teams.value[0])

const items = computed(() => {
  return [
    teams.value.map((team) => ({
      ...team,
      onSelect() {
        selectedTeam.value = team
      }
    })),
    [
      {
        label: 'Create team',
        icon: 'i-lucide-circle-plus'
      },
      {
        label: 'Manage teams',
        icon: 'i-lucide-cog'
      }
    ]
  ]
})
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)'
    }"
  >
    <UButton
      v-bind="{
        ...selectedTeam,
        label: collapsed ? undefined : selectedTeam?.label,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-(--ui-bg-elevated)"
      :class="[!collapsed && 'py-2']"
      :ui="{
        trailingIcon: 'text-(--ui-text-dimmed)'
      }"
    />
  </UDropdownMenu>
</template>
