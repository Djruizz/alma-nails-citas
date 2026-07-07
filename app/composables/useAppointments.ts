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
  const offset = ref(0);
  const hasMore = ref(true);
  const isLoadingMore = ref(false);

  const buildQuery = (filter: StatusFilter, lim: number, off: number) => {
    let query = supabase
      .from("appointments")
      .select("*, clients(*), services(*)", { count: "exact" })
      .order("date", { ascending: true })
      .range(off, off + lim - 1);

    if (filter !== "ALL") {
      query = query.eq("status", filter);
    }

    return query;
  };

  const fetchAppointments = async (filter?: StatusFilter) => {
    if (filter !== undefined) {
      currentFilter.value = filter;
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
    const { error } = await supabase
      .from("appointments")
      .update({ status: "CANCELED" })
      .eq("id", id);
    if (error) throw error;
  };

  return {
    appointments,
    status,
    currentFilter,
    hasMore,
    isLoadingMore,
    fetchAppointments,
    loadMore,
    refresh,
    setFilter,
    createAppointment,
    updateAppointment,
    cancelAppointment,
  };
}
