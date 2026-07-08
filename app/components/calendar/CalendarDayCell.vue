<script setup lang="ts">
import type { CalendarDay } from "~/composables/useCalendar";
import type { Tables } from "~/types/database.types";

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

const props = defineProps<{
  day: CalendarDay;
  isSelected?: boolean;
}>();

const emit = defineEmits<{
  selectDay: [date: Date];
  selectAppointment: [appointment: AppointmentWithRelations];
}>();

const appointmentCount = computed(() => props.day.appointments.length);

function onDayClick() {
  emit("selectDay", props.day.date);
}
</script>

<template>
  <div
    class="border rounded-lg cursor-pointer transition-colors min-h-[44px] p-1.5 sm:min-h-[100px] sm:p-2"
    :class="{
      'bg-muted/20 border-muted': !day.isCurrentMonth,
      'border-neutral-500/50': day.isCurrentMonth,
      'ring-2 ring-primary': day.isToday,
      'bg-primary/10 border-primary': isSelected,
      'hover:bg-muted': !isSelected,
    }"
    @click="onDayClick"
  >
    <div class="flex items-center justify-between">
      <span
        class="text-sm font-medium"
        :class="{
          'text-muted': !day.isCurrentMonth,
          'text-highlighted': day.isCurrentMonth,
        }"
      >
        {{ day.date.getDate() }}
      </span>
      <UBadge
        v-if="appointmentCount > 0"
        :color="isSelected ? 'primary' : 'neutral'"
        size="xs"
        variant="subtle"
        class="sm:hidden"
      >
        {{ appointmentCount }}
      </UBadge>
      <span
        v-if="day.isToday"
        class="text-xs text-primary font-semibold hidden sm:inline"
      >
        Hoy
      </span>
    </div>
    <div class="space-y-1 hidden sm:block mt-1">
      <CalendarAppointmentChip
        v-for="apt in day.appointments.slice(0, 2)"
        :key="apt.id"
        :appointment="apt"
      />
      <div
        v-if="day.appointments.length > 2"
        class="text-xs text-muted text-center"
      >
        +{{ day.appointments.length - 2 }} más
      </div>
    </div>
  </div>
</template>
