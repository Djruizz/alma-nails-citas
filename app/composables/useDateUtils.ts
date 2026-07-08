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

  return {
    toDatetimeLocal,
    fromDatetimeLocal,
    formatDate,
    formatTime,
    formatDateTime,
  };
}
