<script setup lang="ts">
import type { CalendarView } from "~/composables/useCalendar";

defineProps<{
  title: string;
  currentView: CalendarView;
}>();

const emit = defineEmits<{
  prev: [];
  next: [];
  today: [];
  "update:view": [view: CalendarView];
}>();

const viewOptions = [
  { label: "Mes", value: "month" as CalendarView },
  { label: "Semana", value: "week" as CalendarView },
];
</script>

<template>
  <div
    class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
  >
    <div class="flex items-center gap-3">
      <UButton
        icon="i-lucide-chevron-left"
        variant="ghost"
        color="neutral"
        size="md"
        @click="emit('prev')"
      />
      <h2
        class="text-xl font-bold text-highlighted capitalize min-w-[200px] text-center"
      >
        {{ title }}
      </h2>
      <UButton
        icon="i-lucide-chevron-right"
        variant="ghost"
        color="neutral"
        size="md"
        @click="emit('next')"
      />
    </div>
    <div class="flex items-center gap-2">
      <UButton
        label="Hoy"
        variant="soft"
        color="neutral"
        size="md"
        @click="emit('today')"
      />
      <UButton
        v-for="option in viewOptions"
        :key="option.value"
        :label="option.label"
        :color="currentView === option.value ? 'primary' : 'neutral'"
        :variant="currentView === option.value ? 'solid' : 'outline'"
        size="md"
        @click="emit('update:view', option.value)"
      />
    </div>
  </div>
</template>
