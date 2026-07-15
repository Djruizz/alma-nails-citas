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

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "REMEMBER";

export function useAppointments() {
  const supabase = useSupabaseClient();
  const { isValidStatusTransition } = useAppointmentStatus();
  const { toISODateKey } = useDateUtils();

  // ÚNICA fuente de verdad: Map<id, AppointmentWithRelations>
  const appointmentsById = useState<Map<string, AppointmentWithRelations>>(
    "appointments-by-id",
    () => new Map(),
  );

  // Metadata de la lista paginada
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
  const isLoadingMore = useState<boolean>(
    "appointments-is-loading-more",
    () => false,
  );
  const listIdsOrder = useState<string[]>("appointments-list-order", () => []);
  const loadedFilters = useState<Set<StatusFilter>>(
    "appointments-loaded-filters",
    () => new Set(),
  );

  // Metadata del calendario (no guarda datos, solo estado y último rango cargado)
  const calendarStatus = useState<"idle" | "pending" | "success" | "error">(
    "calendar-appointments-status",
    () => "idle",
  );
  const loadedCalendarRange = useState<{ start: string; end: string } | null>(
    "calendar-loaded-range",
    () => null,
  );

  // DERIVADOS (computed) — ya no hay caches duplicados
  const appointments = computed<AppointmentWithRelations[]>(() =>
    listIdsOrder.value
      .map((id) => appointmentsById.value.get(id))
      .filter((a): a is AppointmentWithRelations => !!a),
  );

  const calendarAppointments = computed<
    Record<string, AppointmentWithRelations[]>
  >(() => {
    const grouped: Record<string, AppointmentWithRelations[]> = {};
    for (const a of appointmentsById.value.values()) {
      const key = toISODateKey(new Date(a.date));
      (grouped[key] ??= []).push(a);
    }
    for (const k of Object.keys(grouped)) {
      grouped[k]?.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }
    return grouped;
  });

  // Helpers de mutación del Map (nueva ref para disparar reactividad)
  const mergeIntoMap = (rows: AppointmentWithRelations[]) => {
    const next = new Map(appointmentsById.value);
    for (const r of rows) next.set(r.id, r);
    appointmentsById.value = next;
  };

  const removeFromMap = (id: string) => {
    const next = new Map(appointmentsById.value);
    next.delete(id);
    appointmentsById.value = next;
  };

  const findAppointment = (id: string) => appointmentsById.value.get(id);

  const matchesFilter = (
    appointment: AppointmentWithRelations,
    filter: StatusFilter,
  ): boolean => {
    if (filter === "ALL") return true;
    if (filter === "REMEMBER") {
      if (appointment.status !== "COMPLETED") return false;
      const threeWeeksAgo = new Date();
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
      return new Date(appointment.date) <= threeWeeksAgo;
    }
    return appointment.status === filter;
  };

  const removeFromListIfNotMatching = (
    id: string,
    appointment: AppointmentWithRelations,
  ) => {
    if (status.value === "success" && !matchesFilter(appointment, currentFilter.value)) {
      listIdsOrder.value = listIdsOrder.value.filter((listId) => listId !== id);
    }
  };

  const buildQuery = (filter: StatusFilter, lim: number, off: number) => {
    let query = supabase
      .from("appointments")
      .select("*, clients(*), services(*)", { count: "exact" })
      .order("date", { ascending: false })
      .range(off, off + lim - 1);

    if (filter === "REMEMBER") {
      const threeWeeksAgo = new Date();
      threeWeeksAgo.setDate(threeWeeksAgo.getDate() - 21);
      query = query
        .eq("status", "COMPLETED")
        .lte("date", threeWeeksAgo.toISOString());
    } else if (filter !== "ALL") {
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

    // Short-circuit: solo si ya se cargó previamente el filtro actual,
    // no hubo cambio de filtro, y no se pidió refresco manual.
    if (
      status.value === "success" &&
      loadedFilters.value.has(currentFilter.value) &&
      !filterChanged &&
      filter === undefined
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
    const rows = (data || []) as AppointmentWithRelations[];
    mergeIntoMap(rows);
    listIdsOrder.value = rows.map((r) => r.id);
    loadedFilters.value = new Set([
      ...loadedFilters.value,
      currentFilter.value,
    ]);
    hasMore.value = rows.length === limit;
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

    const rows = (data || []) as AppointmentWithRelations[];
    if (rows.length > 0) {
      mergeIntoMap(rows);
      listIdsOrder.value = [...listIdsOrder.value, ...rows.map((r) => r.id)];
      offset.value = newOffset;
      hasMore.value = rows.length === limit;
    } else {
      hasMore.value = false;
    }
    isLoadingMore.value = false;
  };

  const refresh = async () => {
    // Invalida filtros cargados para forzar refetch desde offset 0
    loadedFilters.value = new Set();
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
    if (data) {
      const row = data as AppointmentWithRelations;
      mergeIntoMap([row]);
      if (status.value === "success" && matchesFilter(row, currentFilter.value)) {
        listIdsOrder.value = [row.id, ...listIdsOrder.value];
      }
    }
    return data;
  };

  const updateAppointment = async (
    id: string,
    payload: TablesUpdate<"appointments">,
  ) => {
    const existing = findAppointment(id);

    // Validar transición de estado si el payload intenta cambiarlo
    if (payload.status && existing) {
      const newStatus = payload.status as Tables<"appointments">["status"];
      if (!isValidStatusTransition(existing.status, newStatus)) {
        throw new Error("Transición de estado inválida");
      }
    }

    const { data, error } = await supabase
      .from("appointments")
      .update(payload)
      .eq("id", id)
      .select("*, clients(*), services(*)")
      .single();
    if (error) throw error;
    if (data) {
      mergeIntoMap([data as AppointmentWithRelations]);
      removeFromListIfNotMatching(id, data as AppointmentWithRelations);
    }
    return data;
  };

  const cancelAppointment = async (id: string) => {
    const appointment = findAppointment(id);
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
      mergeIntoMap([data as AppointmentWithRelations]);
      removeFromListIfNotMatching(id, data as AppointmentWithRelations);
    }
  };

  const confirmAppointment = async (id: string) => {
    const appointment = findAppointment(id);
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
      mergeIntoMap([data as AppointmentWithRelations]);
      removeFromListIfNotMatching(id, data as AppointmentWithRelations);
    }
  };

  const completeAppointment = async (
    id: string,
    payload: { price: number; notes?: string },
  ) => {
    const appointment = findAppointment(id);
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
      mergeIntoMap([data as AppointmentWithRelations]);
      removeFromListIfNotMatching(id, data as AppointmentWithRelations);
    }
  };

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

    const rows = (data || []) as AppointmentWithRelations[];
    // Merge, NO pisa: las citas previas quedan disponibles para la lista paginada
    mergeIntoMap(rows);
    loadedCalendarRange.value = { start: startISO, end: endISO };
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

  const followUpViaWhatsApp = (appointment: AppointmentWithRelations) => {
    const phone = appointment.clients?.phone;
    if (!phone) {
      throw new Error("El cliente no tiene número de teléfono");
    }

    const clientName = appointment.clients?.name || "Cliente";
    const serviceName = appointment.services?.name || "servicio";

    const message = `Hola ${clientName}! ¿Cómo estás? Te escribimos de Alma Nails para saber si quedaste conforme con tu ${serviceName}. ¡Nos encantaría verte de nuevo! ¿Te gustaría agendar tu próxima cita? ¡Gracias!`;

    const cleanPhone = phone.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const deleteAppointment = async (id: string) => {
    const { error } = await supabase
      .from("appointments")
      .delete()
      .eq("id", id);
    if (error) throw error;
    removeFromMap(id);
    listIdsOrder.value = listIdsOrder.value.filter((listId) => listId !== id);
  };

  // Exposed for potential future hard-delete flows
  // removeFromMap is not currently exported to keep the public API minimal

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
    deleteAppointment,
    confirmAppointment,
    completeAppointment,
    remindViaWhatsApp,
    followUpViaWhatsApp,
  };
}
