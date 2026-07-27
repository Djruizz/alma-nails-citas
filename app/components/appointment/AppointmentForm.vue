<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Tables } from "~/types/database.types";
import {
  appointmentSchema,
  type AppointmentSchema,
} from "~/schemas/appointments";

const props = defineProps<{
  appointment?: Tables<"appointments">;
}>();

const emit = defineEmits<{
  submit: [payload: AppointmentSchema];
  cancel: [];
}>();

const { searchClients, getClientById } = useClients();
const { services, fetchServices } = useServices();
const { toDatetimeLocal, fromDatetimeLocal } = useDateUtils();

const supabase = useSupabaseClient();

const allServices = ref<any[]>([]);

// --- Selector de cliente: búsqueda server-side ---
type ClientPick = Awaited<ReturnType<typeof searchClients>>[number];
const clientItems = ref<ClientPick[]>([]);
const clientSearchTerm = ref("");
let clientSearchTimer: ReturnType<typeof setTimeout> | undefined;

const clientOptions = computed(() => {
  return clientItems.value.map((c) => {
    const isCurrent = c.id === props.appointment?.client_id;
    return {
      label: c.name,
      value: c.id,
      description: c.phone ? `Tel: ${c.phone}` : undefined,
      inactive: !c.is_active,
      disabled: !c.is_active && !isCurrent,
    };
  });
});

async function runClientSearch(term: string) {
  try {
    // Si hay un cliente seleccionado actualmente que no esté en los resultados
    // (porque quedó inactivo o fuera del top 20), lo conservamos para que el
    // trigger del SelectMenu siga mostrándolo.
    const currentId = props.appointment?.client_id ?? null;
    const pickedId = state.client_id || null;
    const results = await searchClients(term);

    const keepIds = new Set(
      [currentId, pickedId].filter(
        (id): id is string => id !== null && id !== "",
      ),
    );
    const kept =
      keepIds.size > 0
        ? clientItems.value.filter((c) => keepIds.has(c.id))
        : [];

    const seen = new Set(kept.map((c) => c.id));
    const merged = [...kept];
    for (const c of results) {
      if (!seen.has(c.id)) {
        merged.push(c);
        seen.add(c.id);
      }
    }
    clientItems.value = merged;
  } catch {
    // silencioso: la lista queda como estaba
  }
}

watch(clientSearchTerm, (term) => {
  if (clientSearchTimer) clearTimeout(clientSearchTimer);
  clientSearchTimer = setTimeout(() => runClientSearch(term), 350);
});

const state = reactive<AppointmentSchema>({
  client_id: "",
  service_id: undefined,
  date: "",
  duration_minutes: 60,
  price: undefined,
  notes: "",
});

const formRef = useTemplateRef<{ clearErrors: () => void }>("formRef");

watch(
  () => props.appointment,
  (val) => {
    state.client_id = val?.client_id ?? "";
    state.service_id = val?.service_id ?? undefined;
    state.date = val?.date ? toDatetimeLocal(val.date) : "";
    state.duration_minutes = val?.duration_minutes ?? 60;
    state.price = val?.price ?? undefined;
    state.notes = val?.notes ?? "";
    formRef.value?.clearErrors();
  },
  { immediate: true },
);

onMounted(async () => {
  await fetchServices();
  allServices.value = [...services.value];

  // Carga inicial de clientes (primeros 20 alfabéticos).
  await runClientSearch("");

  if (!props.appointment) return;

  // Aseguramos que el cliente de la cita (aunque esté inactivo) esté disponible
  // para que el trigger del SelectMenu muestre su nombre.
  const clientId = props.appointment?.client_id;
  if (clientId) {
    const existing = clientItems.value.find((c) => c.id === clientId);
    if (!existing) {
      const current = await getClientById(clientId);
      if (current) {
        clientItems.value = [current, ...clientItems.value];
      }
    }
  }

  // Servicio inactivo: mismo patrón que antes via supabase.
  if (props.appointment.service_id) {
    const existingService = allServices.value.find(
      (s) => s.id === props.appointment!.service_id,
    );
    if (!existingService || !existingService.is_active) {
      const { data: serviceData } = await supabase
        .from("services")
        .select("id, name, price, duration_minutes, is_active")
        .eq("id", props.appointment.service_id)
        .single();
      if (
        serviceData &&
        !allServices.value.find((s) => s.id === serviceData.id)
      ) {
        allServices.value.push(serviceData);
      }
    }
  }
});

const serviceOptions = computed(() => {
  return allServices.value.map((s) => ({
    label: s.name,
    value: s.id,
    description: `${s.duration_minutes} min · $${s.price}`,
    inactive: !s.is_active,
    disabled: !s.is_active && s.id !== props.appointment?.service_id,
  }));
});

function onSubmit(event: FormSubmitEvent<AppointmentSchema>) {
  emit("submit", {
    client_id: event.data.client_id,
    service_id: event.data.service_id,
    date: fromDatetimeLocal(event.data.date),
    duration_minutes: event.data.duration_minutes,
    price: event.data.price,
    notes: event.data.notes?.trim(),
  });
}
</script>

<template>
  <UForm
    id="appointment-form"
    ref="formRef"
    :schema="appointmentSchema"
    :state="state"
    class="grid grid-cols-2 gap-4"
    @submit="onSubmit"
  >
    <UFormField name="client_id" label="Cliente" required class="col-span-2">
      <USelectMenu
        v-model="state.client_id"
        v-model:search-term="clientSearchTerm"
        :items="clientOptions"
        value-key="value"
        :search-input="{ placeholder: 'Buscar cliente...' }"
        :ignore-filter="true"
        placeholder="Selecciona un cliente"
        icon="i-lucide-user"
        class="w-full"
      >
        <template #item-label="{ item }">
          <span :class="{ 'text-muted line-through': item.inactive }">
            {{ item.label }}
          </span>
          <span v-if="item.inactive" class="text-xs text-error ml-1">
            (eliminado)
          </span>
        </template>
      </USelectMenu>
    </UFormField>

    <UFormField name="service_id" label="Servicio" class="col-span-2">
      <USelectMenu
        v-model="state.service_id"
        :items="serviceOptions"
        value-key="value"
        :search-input="{ placeholder: 'Buscar servicio...' }"
        placeholder="Selecciona un servicio"
        icon="i-lucide-sparkles"
        class="w-full"
      >
        <template #item-label="{ item }">
          <span :class="{ 'text-muted line-through': item.inactive }">
            {{ item.label }}
          </span>
          <span v-if="item.inactive" class="text-xs text-error ml-1">
            (eliminado)
          </span>
        </template>
      </USelectMenu>
    </UFormField>

    <UFormField name="date" label="Fecha y hora" required class="col-span-2">
      <UInput
        v-model="state.date"
        type="datetime-local"
        icon="i-lucide-calendar"
        class="w-full"
      />
    </UFormField>

    <UFormField name="duration_minutes" label="Duración (min)" required>
      <UInput
        v-model.number="state.duration_minutes"
        type="number"
        min="1"
        icon="i-lucide-clock"
        class="w-full"
      />
    </UFormField>

    <UFormField name="price" label="Precio">
      <UInput
        v-model.number="state.price"
        type="number"
        min="0"
        step="0.01"
        placeholder="0.00"
        icon="i-lucide-dollar-sign"
        class="w-full"
      />
    </UFormField>

    <UFormField name="notes" label="Notas" class="col-span-2">
      <UTextarea
        v-model="state.notes"
        placeholder="Notas adicionales"
        :rows="3"
        autoresize
        :maxrows="6"
        class="w-full"
      />
    </UFormField>
  </UForm>
</template>
