// composables/useClients.ts
import { type Tables, type TablesInsert, type TablesUpdate } from "~/types/database.types";

type Client = Tables<"clients">;

export function useClients() {
  const supabase = useSupabaseClient();

  // useState = estado compartido global por key, sobrevive entre componentes
  const clients = useState<Client[]>("clients", () => []);
  const status = useState<"idle" | "pending" | "success" | "error">(
    "clients-status",
    () => "idle",
  );

  const fetchClients = async () => {
    // si ya hay datos, no vuelve a pedir (a menos que sea forzado)
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

  const createClient = async (payload: TablesInsert<"clients">) => {
    const { data, error } = await supabase
      .from("clients")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    if (data) clients.value.push(data);
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
  };

  return {
    clients,
    status,
    fetchClients,
    refresh,
    createClient,
    updateClient,
    removeClient,
  };
}
