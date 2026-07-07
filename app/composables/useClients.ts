import { type Tables } from "~/types/database.types";
type Client = Tables<"clients">;
export function useClients() {
  const supabase = useSupabaseClient();

  async function fetchClients(): Promise<Client[]> {
    const { data, error } = await supabase.from("clients").select("*");
    if (error) throw error;
    return data;
  }

  return { fetchClients };
}
