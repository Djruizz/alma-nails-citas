import type { Tables } from "~/types/database.types";

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

export type CalendarView = "month" | "week";

export interface CalendarDay {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: AppointmentWithRelations[];
}

export function useCalendar() {
  const {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    toISODateKey,
    addDays,
    addMonths,
    isToday,
  } = useDateUtils();

  const currentView = useState<CalendarView>("calendar-view", () => "month");
  const currentDate = useState<string>("calendar-date", () =>
    toISODateKey(new Date()),
  );

  const viewDate = computed(() => new Date(currentDate.value + "T00:00:00"));

  const monthTitle = computed(() => {
    const d = viewDate.value;
    return d.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  });

  const weekTitle = computed(() => {
    const start = startOfWeek(viewDate.value);
    const end = addDays(start, 6);
    const startStr = start.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
    const endStr = end.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    return `${startStr} – ${endStr}`;
  });

  const title = computed(() =>
    currentView.value === "month" ? monthTitle.value : weekTitle.value,
  );

  const rangeStart = computed(() => {
    if (currentView.value === "month") {
      const monthStart = startOfMonth(viewDate.value);
      return startOfWeek(monthStart);
    }
    return startOfWeek(viewDate.value);
  });

  const rangeEnd = computed(() => {
    if (currentView.value === "month") {
      const monthEnd = endOfMonth(viewDate.value);
      return endOfWeek(monthEnd);
    }
    return addDays(startOfWeek(viewDate.value), 6);
  });

  const rangeStartISO = computed(() => rangeStart.value.toISOString());
  const rangeEndISO = computed(() => {
    const end = new Date(rangeEnd.value);
    end.setDate(end.getDate() + 1);
    return end.toISOString();
  });

  function generateMonthGrid(
    appointmentsByDate: Record<string, AppointmentWithRelations[]>,
  ): CalendarDay[] {
    const grid: CalendarDay[] = [];
    const monthStart = startOfMonth(viewDate.value);
    const gridStart = startOfWeek(monthStart);

    for (let i = 0; i < 42; i++) {
      const date = addDays(gridStart, i);
      const dateKey = toISODateKey(date);
      grid.push({
        date,
        dateKey,
        isCurrentMonth: date.getMonth() === viewDate.value.getMonth(),
        isToday: isToday(date),
        appointments: appointmentsByDate[dateKey] || [],
      });
    }
    return grid;
  }

  function generateWeekDays(
    appointmentsByDate: Record<string, AppointmentWithRelations[]>,
  ): CalendarDay[] {
    const days: CalendarDay[] = [];
    const weekStart = startOfWeek(viewDate.value);

    for (let i = 0; i < 7; i++) {
      const date = addDays(weekStart, i);
      const dateKey = toISODateKey(date);
      days.push({
        date,
        dateKey,
        isCurrentMonth: true,
        isToday: isToday(date),
        appointments: appointmentsByDate[dateKey] || [],
      });
    }
    return days;
  }

  function prev() {
    if (currentView.value === "month") {
      const d = addMonths(viewDate.value, -1);
      currentDate.value = toISODateKey(d);
    } else {
      const d = addDays(viewDate.value, -7);
      currentDate.value = toISODateKey(d);
    }
  }

  function next() {
    if (currentView.value === "month") {
      const d = addMonths(viewDate.value, 1);
      currentDate.value = toISODateKey(d);
    } else {
      const d = addDays(viewDate.value, 7);
      currentDate.value = toISODateKey(d);
    }
  }

  function goToday() {
    currentDate.value = toISODateKey(new Date());
  }

  function setView(view: CalendarView) {
    currentView.value = view;
  }

  const weekDayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

  return {
    currentView,
    currentDate,
    title,
    rangeStartISO,
    rangeEndISO,
    weekDayLabels,
    generateMonthGrid,
    generateWeekDays,
    prev,
    next,
    goToday,
    setView,
  };
}
