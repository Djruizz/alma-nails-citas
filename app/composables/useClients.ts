// composables/useClients.ts
import {
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from "~/types/database.types";

type Client = Tables<"clients">;

// Campos mínimos que trae la búsqueda server-side. Sus campos no son
// opcionales (lo que se pide con `.select("id, name, phone, is_active")`
// SIEMPRE viene poblado), por eso NO es Partial<Client>.
export type ClientPick = {
  id: string;
  name: string;
  phone: string | null;
  is_active: boolean;
};

// Supabase tipa `.select("id, name, phone, is_active")` como la Row completa
// por defecto; otros tipos lo infieren como Partial. Normalizamos al tipo
// narrow no-opcional para que el consumidor acceda con seguridad de tipos.
function toClientPick(row: Partial<Client> | null | undefined): ClientPick | null {
  if (!row || !row.id || !row.name) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? null,
    is_active: row.is_active ?? true,
  };
}

const PAGE_SIZE = 12;
const SEARCH_LIMIT = 10;

export function useClients() {
  const supabase = useSupabaseClient();

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

  // Búsqueda server-side ligera para selectores (AppointmentForm, etc.).
  // Solo trae los campos mínimos: id, name, phone, is_active.
  const searchClients = async (term: string): Promise<ClientPick[]> => {
    const trimmed = term.trim();
    let query = supabase
      .from("clients")
      .select("id, name, phone, is_active")
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(SEARCH_LIMIT);
    if (trimmed) {
      query = query.ilike("name", `%${trimmed}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? [])
      .map((row) => toClientPick(row as Partial<Client>))
      .filter((c): c is ClientPick => c !== null);
  };

  // Obtiene un único cliente por id (para seedear el trigger en modo edición).
  // No filtra por is_active para poder mostrar clientes inactivos de citas previas.
  const getClientById = async (id: string): Promise<ClientPick | null> => {
    const { data, error } = await supabase
      .from("clients")
      .select("id, name, phone, is_active")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return toClientPick(data as Partial<Client>);
  };

  // Conteo exacto de clientes activos (dashboard). head=true → no trae filas.
  const fetchClientsCount = async (): Promise<number> => {
    const { count, error } = await supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);
    if (error) throw error;
    return count ?? 0;
  };

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
      const existingIds = new Set(pagedClients.value.map((c) => c.id));
      const fresh = (data ?? []).filter((c) => !existingIds.has(c.id));
      pagedClients.value = [...pagedClients.value, ...fresh];
    }

    hasMoreClients.value = pagedClients.value.length < clientsTotal.value;
    if (data && data.length === PAGE_SIZE) {
      clientsPage.value += 1;
    } else {
      hasMoreClients.value = false;
    }

    pagedStatus.value = "success";
  };

  const loadMoreClients = async () => {
    if (!hasMoreClients.value || pagedStatus.value === "pending") return;
    await fetchClientsPage();
  };

  const createClient = async (payload: TablesInsert<"clients">) => {
    const { data, error } = await supabase
      .from("clients")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
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
    pagedClients.value = pagedClients.value.filter((c) => c.id !== id);
    clientsTotal.value = Math.max(0, clientsTotal.value - 1);
    hasMoreClients.value = pagedClients.value.length < clientsTotal.value;
  };

  return {
    // Lista paginada (vista de clientes)
    pagedClients,
    pagedStatus,
    clientsTotal,
    hasMoreClients,
    clientSearch,
    clientSort,
    fetchClientsPage,
    loadMoreClients,
    // Búsqueda/lookup server-side
    searchClients,
    getClientById,
    fetchClientsCount,
    // Mutaciones
    createClient,
    updateClient,
    removeClient,
  };
}
