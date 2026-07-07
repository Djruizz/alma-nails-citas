<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6">
    <AppPageHeader
      title="Calendario"
      description="Visualiza las citas en el calendario"
      icon="i-lucide-calendar-days"
    />

    <div class="flex flex-col items-center justify-center gap-3 py-20">
      <div class="flex items-center justify-center size-16 rounded-2xl bg-muted">
        <UIcon name="i-lucide-calendar-days" class="size-8 text-dimmed" />
      </div>
      <p class="text-muted text-sm">No hay eventos en el calendario</p>
    </div>
  </div>
</template>
