<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6">
    <AppPageHeader
      title="Citas"
      description="Gestiona las citas de tus clientes"
      icon="i-lucide-calendar-check"
    >
      <template #actions>
        <UButton icon="i-lucide-plus" label="Nueva cita" size="md" />
      </template>
    </AppPageHeader>

    <div class="flex flex-col items-center justify-center gap-3 py-20">
      <div class="flex items-center justify-center size-16 rounded-2xl bg-muted">
        <UIcon name="i-lucide-calendar-check" class="size-8 text-dimmed" />
      </div>
      <p class="text-muted text-sm">No hay citas programadas</p>
    </div>
  </div>
</template>
