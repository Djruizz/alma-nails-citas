<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
    <AppPageHeader
      title="Clientes"
      description="Gestiona tus clientes y sus datos"
      icon="i-lucide-users"
    >
      <template #actions>
        <UButton icon="i-lucide-user-plus" label="Nuevo" size="md" />
      </template>
    </AppPageHeader>

    <div class="flex flex-col items-center justify-center gap-3 py-20">
      <div class="flex items-center justify-center size-16 rounded-2xl bg-muted">
        <UIcon name="i-lucide-users" class="size-8 text-dimmed" />
      </div>
      <p class="text-muted text-sm">Aún no tienes clientes registrados</p>
    </div>
  </div>
</template>
