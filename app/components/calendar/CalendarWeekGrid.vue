<script setup lang="ts">
import type { CalendarDay } from "~/composables/useCalendar";

defineProps<{
  days: CalendarDay[];
  selectedDateKey?: string;
}>();

const emit = defineEmits<{
  selectDay: [date: Date];
}>();

function onDayClick(date: Date) {
  emit("selectDay", date);
}
</script>

<template>
  <div class="grid grid-cols-7 gap-2">
    <div
      v-for="day in days"
      :key="day.dateKey"
      class="flex flex-col items-center justify-start p-3 border rounded-lg cursor-pointer transition-colors min-h-[100px]"
      :class="{
        'bg-muted/20': !day.isCurrentMonth,
        'ring-2 ring-primary': day.isToday,
        'bg-primary/10 border-primary': day.dateKey === selectedDateKey,
        'hover:bg-muted/30': day.dateKey !== selectedDateKey,
      }"
      @click="onDayClick(day.date)"
    >
      <span class="text-xs font-medium text-muted uppercase">
        {{ day.date.toLocaleDateString("es-ES", { weekday: "short" }) }}
      </span>
      <span
        class="text-2xl font-bold mt-1"
        :class="{
          'text-primary': day.isToday,
          'text-highlighted': !day.isToday,
        }"
      >
        {{ day.date.getDate() }}
      </span>
      <div class="mt-2 h-5 flex items-center">
        <UBadge
          v-if="day.appointments.length > 0"
          :color="day.dateKey === selectedDateKey ? 'primary' : 'neutral'"
          size="xs"
          variant="subtle"
        >
          {{ day.appointments.length }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
