// composables/useAppointments.ts
import {
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from "~/types/database.types";

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";

export function useAppointments() {
  const supabase = useSupabaseClient();
  const { isValidStatusTransition } = useAppointmentStatus();

  const appointments = useState<AppointmentWithRelations[]>(
    "appointments",
    () => [],
  );
  const status = useState<"idle" | "pending" | "success" | "error">(
    "appointments-status",
    () => "idle",
  );
  const currentFilter = useState<StatusFilter>(
    "appointments-filter",
    () => "ALL",
  );
  const limit = 10;
  const offset = useState<number>("appointments-offset", () => 0);
  const hasMore = useState<boolean>("appointments-has-more", () => true);
  const isLoadingMore = ref(false);

  const buildQuery = (filter: StatusFilter, lim: number, off: number) => {
    let query = supabase
      .from("appointments")
      .select("*, clients(*), services(*)", { count: "exact" })
      .order("date", { ascending: false })
      .range(off, off + lim - 1);

    if (filter !== "ALL") {
      query = query.eq("status", filter);
    }

    return query;
  };

  const fetchAppointments = async (filter?: StatusFilter) => {
    const previousFilter = currentFilter.value;

    if (filter !== undefined) {
      currentFilter.value = filter;
    }

    const filterChanged = filter !== undefined && filter !== previousFilter;

    if (
      status.value === "success" &&
      appointments.value.length > 0 &&
      !filterChanged &&
      (filter === undefined || filter === currentFilter.value)
    ) {
      return;
    }

    status.value = "pending";
    offset.value = 0;
    hasMore.value = true;

    const { data, error } = await buildQuery(currentFilter.value, limit, 0);
    if (error) {
      status.value = "error";
      throw error;
    }
    appointments.value = data || [];
    hasMore.value = data?.length === limit;
    status.value = "success";
  };

  const loadMore = async () => {
    if (isLoadingMore.value || !hasMore.value) return;

    isLoadingMore.value = true;
    const newOffset = offset.value + limit;

    const { data, error } = await buildQuery(
      currentFilter.value,
      limit,
      newOffset,
    );
    if (error) {
      isLoadingMore.value = false;
      throw error;
    }

    if (data && data.length > 0) {
      appointments.value.push(...data);
      offset.value = newOffset;
      hasMore.value = data.length === limit;
    } else {
      hasMore.value = false;
    }
    isLoadingMore.value = false;
  };

  const refresh = async () => {
    status.value = "idle";
    await fetchAppointments(currentFilter.value);
  };

  const setFilter = async (filter: StatusFilter) => {
    await fetchAppointments(filter);
  };

  const createAppointment = async (payload: TablesInsert<"appointments">) => {
    const { data, error } = await supabase
      .from("appointments")
      .insert(payload)
      .select("*, clients(*), services(*)")
      .single();
    if (error) throw error;
    if (data) appointments.value.unshift(data);
    return data;
  };

  const updateAppointment = async (
    id: string,
    payload: TablesUpdate<"appointments">,
  ) => {
    const { data, error } = await supabase
      .from("appointments")
      .update(payload)
      .eq("id", id)
      .select("*, clients(*), services(*)")
      .single();
    if (error) throw error;
    if (data) {
      const idx = appointments.value.findIndex((a) => a.id === id);
      if (idx !== -1) appointments.value[idx] = data;
    }
    return data;
  };

  const cancelAppointment = async (id: string) => {
    const appointment = appointments.value.find((a) => a.id === id);
    if (!appointment) {
      throw new Error("Cita no encontrada");
    }

    if (!isValidStatusTransition(appointment.status, "CANCELED")) {
      throw new Error("No se puede cancelar esta cita en su estado actual");
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "CANCELED", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, clients(*), services(*)")
      .single();

    if (error) throw error;

    if (data) {
      const idx = appointments.value.findIndex((a) => a.id === id);
      if (idx !== -1) appointments.value[idx] = data;
    }
  };

  const confirmAppointment = async (id: string) => {
    const appointment = appointments.value.find((a) => a.id === id);
    if (!appointment) {
      throw new Error("Cita no encontrada");
    }

    if (!isValidStatusTransition(appointment.status, "CONFIRMED")) {
      throw new Error("No se puede confirmar esta cita en su estado actual");
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({ status: "CONFIRMED", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, clients(*), services(*)")
      .single();

    if (error) throw error;

    if (data) {
      const idx = appointments.value.findIndex((a) => a.id === id);
      if (idx !== -1) appointments.value[idx] = data;
    }
  };

  const completeAppointment = async (
    id: string,
    payload: { price: number; notes?: string },
  ) => {
    const appointment = appointments.value.find((a) => a.id === id);
    if (!appointment) {
      throw new Error("Cita no encontrada");
    }

    if (!isValidStatusTransition(appointment.status, "COMPLETED")) {
      throw new Error("No se puede completar esta cita en su estado actual");
    }

    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "COMPLETED",
        price: payload.price,
        notes: payload.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, clients(*), services(*)")
      .single();

    if (error) throw error;

    if (data) {
      const idx = appointments.value.findIndex((a) => a.id === id);
      if (idx !== -1) appointments.value[idx] = data;
    }
  };

  const calendarAppointments = useState<Record<string, AppointmentWithRelations[]>>(
    "calendar-appointments",
    () => ({}),
  );
  const calendarStatus = useState<"idle" | "pending" | "success" | "error">(
    "calendar-appointments-status",
    () => "idle",
  );

  const fetchAppointmentsByRange = async (startISO: string, endISO: string) => {
    calendarStatus.value = "pending";
    const { data, error } = await supabase
      .from("appointments")
      .select("*, clients(*), services(*)")
      .gte("date", startISO)
      .lt("date", endISO)
      .order("date", { ascending: true });

    if (error) {
      calendarStatus.value = "error";
      throw error;
    }

    const grouped: Record<string, AppointmentWithRelations[]> = {};
    for (const apt of (data || []) as AppointmentWithRelations[]) {
      const d = new Date(apt.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(apt);
    }

    calendarAppointments.value = grouped;
    calendarStatus.value = "success";
  };

  const refreshCalendar = async (startISO: string, endISO: string) => {
    calendarStatus.value = "idle";
    await fetchAppointmentsByRange(startISO, endISO);
  };

  const remindViaWhatsApp = (appointment: AppointmentWithRelations) => {
    const phone = appointment.clients?.phone;
    if (!phone) {
      throw new Error("El cliente no tiene número de teléfono");
    }

    const { formatDate, formatTime } = useDateUtils();

    const clientName = appointment.clients?.name || "Cliente";
    const formattedDate = formatDate(appointment.date, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    const formattedTime = formatTime(appointment.date, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const serviceName = appointment.services?.name || "servicio";

    const message = `Hola ${clientName}! Te recordamos tu cita de ${serviceName} el ${formattedDate} a las ${formattedTime}. Por favor confirma tu asistencia. ¡Gracias!`;

    const cleanPhone = phone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  return {
    appointments,
    status,
    currentFilter,
    hasMore,
    isLoadingMore,
    calendarAppointments,
    calendarStatus,
    fetchAppointments,
    loadMore,
    refresh,
    setFilter,
    fetchAppointmentsByRange,
    refreshCalendar,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    confirmAppointment,
    completeAppointment,
    remindViaWhatsApp,
  };
}
