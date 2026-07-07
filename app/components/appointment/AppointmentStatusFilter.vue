<script setup lang="ts">
type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";

const modelValue = defineModel<StatusFilter>({ default: "ALL" });

const statusFilters = [
  {
    label: "Todas",
    value: "ALL" as const,
    icon: "i-lucide-list",
    color: "neutral",
  },
  {
    label: "Pendientes",
    value: "PENDING" as const,
    icon: "i-lucide-clock",
    color: "warning",
  },
  {
    label: "Confirmadas",
    value: "CONFIRMED" as const,
    icon: "i-lucide-check-circle",
    color: "info",
  },
  {
    label: "Completadas",
    value: "COMPLETED" as const,
    icon: "i-lucide-check-check",
    color: "success",
  },
  {
    label: "Canceladas",
    value: "CANCELED" as const,
    icon: "i-lucide-x-circle",
    color: "error",
  },
];

const currentFilter = computed(
  () =>
    statusFilters.find((f) => f.value === modelValue.value) || statusFilters[0],
);
</script>

<template>
  <div class="flex items-center gap-3">
    <USelect
      v-model="modelValue"
      :items="statusFilters"
      item-label="label"
      item-value="value"
      class="w-52"
    >
      <template #leading>
        <UIcon
          :name="currentFilter?.icon || ''"
          class="size-4"
          :class="`text-${currentFilter?.color || ''}`"
        />
      </template>
      <template #item="{ item }">
        <div class="flex items-center gap-2">
          <UIcon :name="item.icon" class="size-4" />
          <span>{{ item.label }}</span>
        </div>
      </template>
    </USelect>
  </div>
</template>
