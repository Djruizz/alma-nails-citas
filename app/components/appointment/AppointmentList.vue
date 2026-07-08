<script setup lang="ts">
import type { Tables } from "~/types/database.types";

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

const props = defineProps<{
  appointments: AppointmentWithRelations[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  edit: [appointment: AppointmentWithRelations];
  detail: [appointment: AppointmentWithRelations];
}>();
</script>

<template>
  <div v-if="loading" class="grid gap-4">
    <USkeleton v-for="i in 3" :key="i" class="h-32 rounded-xl" />
  </div>

  <div
    v-else-if="appointments.length === 0"
    class="flex flex-col items-center justify-center gap-3 py-20"
  >
    <div class="flex items-center justify-center size-16 rounded-2xl bg-muted">
      <UIcon name="i-lucide-calendar-check" class="size-8 text-dimmed" />
    </div>
    <p class="text-muted text-sm">No hay citas programadas</p>
  </div>

  <div v-else class="grid gap-4">
    <AppointmentCard
      v-for="appointment in appointments"
      :key="appointment.id"
      :appointment="appointment"
      show-actions
      @edit="emit('edit', $event)"
      @detail="emit('detail', $event)"
    />
  </div>
</template>
