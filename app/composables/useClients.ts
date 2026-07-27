// composables/useClients.ts
import { type Tables, type TablesInsert, type TablesUpdate } from "~/types/database.types";

type Client = Tables<"clients">;

const PAGE_SIZE = 12;

export function useClients() {
  const supabase = useSupabaseClient();

  // Estado de la lista COMPLETA (usado por AppointmentForm y dashboard).
  // Se mantiene por compatibilidad; no paginarlo.
  const clients = useState<Client[]>("clients", () => []);
  const status = useState<"idle" | "pending" | "success" | "error">(
    "clients-status",
    () => "idle",
  );

  // Estado paginado para la página de listado de clientes.
  const pagedClients = useState<Client[]>("clients-paged", () => []);
  const pagedStatus = useState<"idle" | "pending" | "success" | "error">(
    "clients-paged-status",
    () => "idle",
  );
  const clientsPage = useState<number>("clients-page", () => 0);
  const clientsTotal = useState<number>("clients-total", () => 0);
  const hasMoreClients = useState<boolean>("clients-has-more", () => false);

  // Filtros de la vista de listado (sobreviven entre navegaciones).
  const clientSearch = useState<string>("clients-search", () => "");
  const clientSort = useState<"asc" | "desc">("clients-sort", () => "asc");

  const fetchClients = async () => {
    if (clients.value.length > 0 && status.value === "success") return;
    status.value = "pending";
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("is_active", true);
    if (error) {
      status.value = "error";
      throw error;
    }
    clients.value = data;
    status.value = "success";
  };

  const refresh = async () => {
    status.value = "pending";
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("is_active", true);
    if (error) {
      status.value = "error";
      throw error;
    }
    clients.value = data;
    status.value = "success";
  };

  // Paginación: trae una página aplicando búsqueda y orden server-side.
  // reset=true recarga desde la primera página (usado al cambiar filtro o tras crear/editar/eliminar).
  const fetchClientsPage = async (opts: { reset?: boolean } = {}) => {
    const resetPage = opts.reset ?? false;
    if (resetPage) {
      clientsPage.value = 0;
      if (pagedStatus.value === "pending") return;
    } else if (pagedStatus.value === "pending") {
      return;
    }

    pagedStatus.value = "pending";

    const from = clientsPage.value * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const ascending = clientSort.value === "asc";
    const term = clientSearch.value.trim();

    let query = supabase
      .from("clients")
      .select("*", { count: "exact" })
      .eq("is_active", true)
      .order("name", { ascending });

    if (term) {
      query = query.ilike("name", `%${term}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      pagedStatus.value = "error";
      throw error;
    }

    clientsTotal.value = count ?? 0;

    if (resetPage) {
      pagedClients.value = data ?? [];
    } else {
      // Evita duplicados por id (por si las dudas tras ediciones)
      const existingIds = new Set(pagedClients.value.map((c) => c.id));
      const fresh = (data ?? []).filter((c) => !existingIds.has(c.id));
      pagedClients.value = [...pagedClients.value, ...fresh];
    }

    hasMoreClients.value = pagedClients.value.length < clientsTotal.value;
    if (data && data.length === PAGE_SIZE) {
      clientsPage.value += 1;
    } else {
      // última página: dejamos clientsPage tal cual para que hasMore sea false
      hasMoreClients.value = false;
    }

    pagedStatus.value = "success";
  };

  const loadMoreClients = async () => {
    if (!hasMoreClients.value || pagedStatus.value === "pending") return;
    await fetchClientsPage();
  };

  const resetClientsPage = async () => {
    await fetchClientsPage({ reset: true });
  };

  const createClient = async (payload: TablesInsert<"clients">) => {
    const { data, error } = await supabase
      .from("clients")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    if (data) clients.value.push(data);
    // Recarga la vista paginada para reflejar el nuevo cliente
    await fetchClientsPage({ reset: true }).catch(() => {});
    return data;
  };

  const updateClient = async (id: string, payload: TablesUpdate<"clients">) => {
    const { data, error } = await supabase
      .from("clients")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    if (data) {
      const idx = clients.value.findIndex((c) => c.id === id);
      if (idx !== -1) clients.value[idx] = data;
      const pIdx = pagedClients.value.findIndex((c) => c.id === id);
      if (pIdx !== -1) pagedClients.value[pIdx] = data;
    }
    return data;
  };

  const removeClient = async (id: string) => {
    const { error } = await supabase
      .from("clients")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
    clients.value = clients.value.filter((c) => c.id !== id);
    pagedClients.value = pagedClients.value.filter((c) => c.id !== id);
    clientsTotal.value = Math.max(0, clientsTotal.value - 1);
    hasMoreClients.value = pagedClients.value.length < clientsTotal.value;
  };

  return {
    // Lista completa (AppointmentForm, dashboard)
    clients,
    status,
    fetchClients,
    refresh,
    // Lista paginada (vista de clientes)
    pagedClients,
    pagedStatus,
    clientsTotal,
    hasMoreClients,
    clientSearch,
    clientSort,
    fetchClientsPage,
    loadMoreClients,
    resetClientsPage,
    // Mutaciones
    createClient,
    updateClient,
    removeClient,
  };
}