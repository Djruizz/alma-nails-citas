<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { fetchClients } = useClients()
const clients = ref<Awaited<ReturnType<typeof fetchClients>>>([])
const error = ref<string | null>(null)

try {
  clients.value = await fetchClients()
} catch (e) {
  error.value = (e as Error).message
}

const stats = computed(() => [
  {
    label: 'Total Clientes',
    value: clients.value.length,
    icon: 'i-lucide-users',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    label: 'Citas Hoy',
    value: 0,
    icon: 'i-lucide-calendar-check',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    label: 'Pendientes',
    value: 0,
    icon: 'i-lucide-clock',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
])
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
    <AppPageHeader
      title="Panel"
      description="Resumen de tu actividad"
      icon="i-lucide-layout-dashboard"
    />

    <div class="grid grid-cols-3 gap-3 sm:gap-4">
      <UCard
        v-for="stat in stats"
        :key="stat.label"
        :ui="{ body: 'p-3 sm:p-4' }"
      >
        <div class="flex flex-col gap-2">
          <div
            class="flex items-center justify-center size-9 rounded-lg shrink-0"
            :class="stat.bg"
          >
            <UIcon :name="stat.icon" class="size-5" :class="stat.color" />
          </div>
          <p class="text-2xl font-bold text-highlighted leading-none">
            {{ stat.value }}
          </p>
          <p class="text-xs text-muted leading-none">{{ stat.label }}</p>
        </div>
      </UCard>
    </div>

    <UAlert
      v-if="error"
      :title="error"
      icon="i-lucide-alert-circle"
      color="error"
      variant="subtle"
    />
  </div>
</template>
