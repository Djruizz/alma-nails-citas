// composables/useDateUtils.ts
export function useDateUtils() {
  const toDatetimeLocal = (isoString: string): string => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const fromDatetimeLocal = (datetimeLocal: string): string => {
    const [datePart, timePart] = datetimeLocal.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);
    
    const localDate = new Date(year, month - 1, day, hours, minutes);
    return localDate.toISOString();
  };

  const formatDate = (
    isoString: string,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    const date = new Date(isoString);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return date.toLocaleDateString("es-ES", { ...defaultOptions, ...options });
  };

  const formatTime = (
    isoString: string,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    const date = new Date(isoString);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleTimeString("es-ES", { ...defaultOptions, ...options });
  };

  const formatDateTime = (
    isoString: string,
    options?: Intl.DateTimeFormatOptions,
  ): string => {
    const date = new Date(isoString);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleString("es-ES", { ...defaultOptions, ...options });
  };

  const startOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const endOfMonth = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const startOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const endOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() + (day === 0 ? 0 : 7 - day);
    d.setDate(diff);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const toISODateKey = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const addDays = (date: Date, days: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const addMonths = (date: Date, months: number): Date => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
  };

  const weeksSince = (isoString: string): number => {
    const appointmentDate = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - appointmentDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  };

  const isWeeksOrMoreAgo = (isoString: string, weeks: number): boolean => {
    return weeksSince(isoString) >= weeks;
  };

  return {
    toDatetimeLocal,
    fromDatetimeLocal,
    formatDate,
    formatTime,
    formatDateTime,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    toISODateKey,
    addDays,
    addMonths,
    isSameDay,
    isToday,
    weeksSince,
    isWeeksOrMoreAgo,
  };
}
