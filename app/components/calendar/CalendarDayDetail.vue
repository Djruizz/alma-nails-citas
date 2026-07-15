<script setup lang="ts">
import type { CalendarDay } from "~/composables/useCalendar";
import type { Tables } from "~/types/database.types";

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

const props = defineProps<{
  day: CalendarDay | null;
}>();

const emit = defineEmits<{
  selectAppointment: [appointment: AppointmentWithRelations];
  deleteAppointment: [appointment: AppointmentWithRelations];
  createForDate: [date: Date];
  clear: [];
}>();

const { formatDate } = useDateUtils();

const formattedDate = computed(() => {
  if (!props.day) return "";
  return formatDate(props.day.date.toISOString(), {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
});
</script>

<template>
  <div v-if="day" class="space-y-3">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-base font-semibold text-highlighted capitalize">
          {{ formattedDate }}
        </h3>
        <p class="text-sm text-muted">
          {{ day.appointments.length }}
          {{ day.appointments.length === 1 ? "cita" : "citas" }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButton
          icon="i-lucide-plus"
          size="sm"
          color="primary"
          @click="emit('createForDate', day.date)"
        />
        <UButton
          icon="i-lucide-x"
          size="sm"
          variant="ghost"
          color="neutral"
          @click="emit('clear')"
        />
      </div>
    </div>

    <div v-if="day.appointments.length === 0" class="text-center py-6">
      <UIcon
        name="i-lucide-calendar-x"
        class="size-8 text-muted mx-auto mb-2"
      />
      <p class="text-sm text-muted">Sin citas para este día</p>
    </div>

    <div v-else class="space-y-2">
      <AppointmentCard
        v-for="apt in day.appointments"
        :key="apt.id"
        :appointment="apt"
        @detail="emit('selectAppointment', apt)"
        @delete="emit('deleteAppointment', apt)"
        show-actions
      />
    </div>
  </div>
</template>
