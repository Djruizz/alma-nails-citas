<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  loading?: boolean;
}>();

defineEmits<{ back: [] }>();
</script>

<template>
  <div class="flex items-center gap-3 sm:gap-4">
    <UButton
      icon="i-lucide-arrow-left"
      color="neutral"
      variant="ghost"
      size="md"
      @click="$emit('back')"
    />
    <div class="flex-1 min-w-0">
      <h1 class="text-xl font-bold tracking-tight text-highlighted truncate">
        <USkeleton v-if="loading" class="h-6 w-40" />
        <template v-else>{{ title }}</template>
      </h1>
      <p v-if="description" class="text-sm text-muted truncate">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex items-center gap-2 shrink-0">
      <slot name="actions" />
    </div>
  </div>
</template>