<script setup lang="ts">
import type { Tables } from "~/types/database.types";

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

const props = defineProps<{
  appointments: AppointmentWithRelations[];
}>();

const stats = computed(() => {
  const list = props.appointments;
  const total = list.length;
  const completed = list.filter((a) => a.status === "COMPLETED").length;
  const canceled = list.filter((a) => a.status === "CANCELED").length;
  const upcoming = list.filter(
    (a) => a.status === "PENDING" || a.status === "CONFIRMED",
  ).length;
  return [
    {
      label: "Total",
      value: total,
      icon: "i-lucide-calendar-check",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Completadas",
      value: completed,
      icon: "i-lucide-check-check",
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Próximas",
      value: upcoming,
      icon: "i-lucide-clock",
      color: "text-warning",
      bg: "bg-warning/10",
    },
    {
      label: "Canceladas",
      value: canceled,
      icon: "i-lucide-x-circle",
      color: "text-error",
      bg: "bg-error/10",
    },
  ];
});
</script>

<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
    <UCard
      v-for="stat in stats"
      :key="stat.label"
      variant="subtle"
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
</template>