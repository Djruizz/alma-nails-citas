<script setup lang="ts">
import type { CalendarDay } from "~/composables/useCalendar";

defineProps<{
  days: CalendarDay[];
  selectedDateKey?: string;
}>();

const weekDayLabels = ["L", "M", "X", "J", "V", "S", "D"];
</script>

<template>
  <div class="space-y-2">
    <div class="grid grid-cols-7 gap-1 sm:gap-2">
      <div
        v-for="label in weekDayLabels"
        :key="label"
        class="text-center text-xs sm:text-sm font-semibold text-muted py-1 sm:py-2"
      >
        {{ label }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1 sm:gap-2">
      <CalendarDayCell
        v-for="day in days"
        :key="day.dateKey"
        :day="day"
        :is-selected="day.dateKey === selectedDateKey"
        v-bind="$attrs"
      />
    </div>
  </div>
</template>
