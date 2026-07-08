<script setup lang="ts">
import type { Tables } from "~/types/database.types";
import type { CalendarDay } from "~/composables/useCalendar";

definePageMeta({ layout: "default" });

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

const {
  currentView,
  title,
  rangeStartISO,
  rangeEndISO,
  generateMonthGrid,
  generateWeekDays,
  prev,
  next,
  goToday,
  setView,
} = useCalendar();

const {
  calendarAppointments,
  calendarStatus,
  fetchAppointmentsByRange,
  refreshCalendar,
} = useAppointments();

const { toISODateKey } = useDateUtils();

const monthGrid = computed(() => generateMonthGrid(calendarAppointments.value));
const weekDays = computed(() => generateWeekDays(calendarAppointments.value));

const selectedDateKey = ref<string | undefined>(undefined);

const selectedDay = computed<CalendarDay | null>(() => {
  if (!selectedDateKey.value) return null;
  return (
    monthGrid.value.find((d) => d.dateKey === selectedDateKey.value) || null
  );
});

const modal = reactive({
  open: false,
  mode: "create" as "create" | "edit",
  appointment: null as AppointmentWithRelations | null,
});

const detailModal = reactive({
  open: false,
  appointment: null as AppointmentWithRelations | null,
});

function openCreateForDate(date: Date) {
  modal.mode = "create";
  modal.appointment = {
    date: date.toISOString(),
  } as any;
  modal.open = true;
}

function openDetail(appointment: AppointmentWithRelations) {
  detailModal.appointment = appointment;
  detailModal.open = true;
}

function onSelectDay(date: Date) {
  const dateKey = toISODateKey(date);
  if (selectedDateKey.value === dateKey) {
    selectedDateKey.value = undefined;
    return;
  }
  selectedDateKey.value = dateKey;
}

function onSelectAppointment(appointment: AppointmentWithRelations) {
  openDetail(appointment);
}

function clearSelectedDay() {
  selectedDateKey.value = undefined;
}

watch(
  [rangeStartISO, rangeEndISO],
  async ([start, end]) => {
    await fetchAppointmentsByRange(start, end);
  },
  { immediate: true },
);

watch(
  () => calendarStatus.value,
  async (status) => {
    if (status === "idle") {
      await fetchAppointmentsByRange(rangeStartISO.value, rangeEndISO.value);
    }
  },
);
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6">
    <AppPageHeader
      title="Calendario"
      description="Visualiza las citas en el calendario"
      icon="i-lucide-calendar-days"
    >
      <template #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="ghost"
          color="neutral"
          size="md"
          :ui="{
            leadingIcon:
              calendarStatus === 'pending' ? 'animate-spin duration-200' : '',
          }"
          @click="refreshCalendar(rangeStartISO, rangeEndISO)"
        />
      </template>
    </AppPageHeader>

    <CalendarHeader
      :title="title"
      :current-view="currentView"
      @prev="prev"
      @next="next"
      @today="goToday"
      @update:view="setView"
    />

    <div
      v-if="calendarStatus === 'pending'"
      class="flex items-center justify-center py-20"
    >
      <UIcon name="i-lucide-loader" class="size-8 animate-spin text-primary" />
    </div>

    <template v-else>
      <CalendarMonthGrid
        v-if="currentView === 'month'"
        :days="monthGrid"
        :selected-date-key="selectedDateKey"
        @select-day="onSelectDay"
        @select-appointment="onSelectAppointment"
      />
      <CalendarWeekGrid
        v-else
        :days="weekDays"
        :selected-date-key="selectedDateKey"
        @select-day="onSelectDay"
      />

      <CalendarDayDetail
        v-if="selectedDay"
        :day="selectedDay"
        @select-appointment="onSelectAppointment"
        @create-for-date="openCreateForDate"
        @clear="clearSelectedDay"
      />
    </template>

    <AppointmentModal
      v-model:open="modal.open"
      :mode="modal.mode"
      :appointment="modal.appointment ?? undefined"
    />

    <AppointmentDetailModal
      v-model:open="detailModal.open"
      :appointment="detailModal.appointment ?? undefined"
    />
  </div>
</template>
