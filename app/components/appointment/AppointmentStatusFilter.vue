<script setup lang="ts">
type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "REMEMBER";

const modelValue = defineModel<StatusFilter>({ default: "ALL" });

const statusFilters = [
  {
    label: "Todas",
    value: "ALL" as const,
    icon: "i-lucide-list",
    iconColor: "text-neutral-500",
  },
  {
    label: "Pendientes",
    value: "PENDING" as const,
    icon: "i-lucide-clock",
    iconColor: "text-yellow-500",
  },
  {
    label: "Confirmadas",
    value: "CONFIRMED" as const,
    icon: "i-lucide-check-circle",
    iconColor: "text-blue-500",
  },
  {
    label: "Completadas",
    value: "COMPLETED" as const,
    icon: "i-lucide-check-check",
    iconColor: "text-green-500",
  },
  {
    label: "Canceladas",
    value: "CANCELED" as const,
    icon: "i-lucide-x-circle",
    iconColor: "text-red-500",
  },
  {
    label: "Recordar",
    value: "REMEMBER" as const,
    icon: "i-lucide-bell-ring",
    iconColor: "text-purple-500",
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
          :class="currentFilter?.iconColor || ''"
        />
      </template>
      <template #item="{ item }">
        <div class="flex items-center gap-2">
          <UIcon :name="item.icon" class="size-4" :class="item.iconColor" />
          <span>{{ item.label }}</span>
        </div>
      </template>
    </USelect>
  </div>
</template>
