<script setup lang="ts">
definePageMeta({ layout: 'default' })
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
    <AppPageHeader
      title="Configuración"
      description="Ajustes de la aplicación y tu cuenta"
      icon="i-lucide-settings"
    />

    <div class="space-y-4">
      <UCard>
        <template #header>
          <h3 class="font-semibold text-default">Cuenta</h3>
        </template>
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">Cambiar contraseña</span>
          <UButton icon="i-lucide-chevron-right" variant="ghost" color="neutral" />
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold text-default">Preferencias</h3>
        </template>
        <div class="flex items-center justify-between">
          <span class="text-sm text-muted">Tema oscuro</span>
          <UColorModeSwitch />
        </div>
      </UCard>
    </div>
  </div>
</template>
