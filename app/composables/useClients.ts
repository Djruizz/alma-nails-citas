// composables/useClients.ts
import { type Tables } from "~/types/database.types";

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
    const { data, error } = await supabase.from("clients").select("*");
    if (error) {
      status.value = "error";
      throw error;
    }
    clients.value = data;
    status.value = "success";
  };

  const refresh = async () => {
    status.value = "pending";
    const { data, error } = await supabase.from("clients").select("*");
    if (error) {
      status.value = "error";
      throw error;
    }
    clients.value = data;
    status.value = "success";
  };

  return {
    clients,
    status,
    fetchClients, // llama esto en cada página (onMounted o directo en <script setup>)
    refresh, // fuerza recarga real
  };
}
