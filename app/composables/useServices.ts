// composables/useServices.ts
import {
  type Tables,
  type TablesInsert,
  type TablesUpdate,
} from "~/types/database.types";

type Service = Tables<"services">;

export function useServices() {
  const supabase = useSupabaseClient();

  const services = useState<Service[]>("services", () => []);
  const status = useState<"idle" | "pending" | "success" | "error">(
    "services-status",
    () => "idle",
  );

  const fetchServices = async () => {
    if (services.value.length > 0 && status.value === "success") return;

    status.value = "pending";
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (error) {
      status.value = "error";
      throw error;
    }
    services.value = data;
    status.value = "success";
  };

  const refresh = async () => {
    status.value = "pending";
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (error) {
      status.value = "error";
      throw error;
    }
    services.value = data;
    status.value = "success";
  };

  const createService = async (payload: TablesInsert<"services">) => {
    const { data, error } = await supabase
      .from("services")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    if (data) services.value.push(data);
    return data;
  };

  const updateService = async (
    id: string,
    payload: TablesUpdate<"services">,
  ) => {
    const { data, error } = await supabase
      .from("services")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    if (data) {
      const idx = services.value.findIndex((s) => s.id === id);
      if (idx !== -1) services.value[idx] = data;
    }
    return data;
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from("services")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
    services.value = services.value.filter((s) => s.id !== id);
  };

  return {
    services,
    status,
    fetchServices,
    refresh,
    createService,
    updateService,
    deleteService,
  };
}
