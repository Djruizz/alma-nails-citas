<script setup lang="ts">
defineEmits<{ back: [] }>();
</script>

<template>
  <UCard variant="subtle" :ui="{ body: 'p-6' }">
    <div class="flex flex-col items-center justify-center gap-3 py-10">
      <div
        class="flex items-center justify-center size-16 rounded-2xl bg-muted"
      >
        <UIcon name="i-lucide-user-x" class="size-8 text-dimmed" />
      </div>
      <p class="text-muted text-sm">No se encontró este cliente</p>
      <UButton
        label="Volver a clientes"
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="soft"
        @click="$emit('back')"
      />
    </div>
  </UCard>
</template>