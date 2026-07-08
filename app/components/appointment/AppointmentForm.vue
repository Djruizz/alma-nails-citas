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

const { clients, fetchClients } = useClients();
const { services, fetchServices } = useServices();
const { toDatetimeLocal, fromDatetimeLocal } = useDateUtils();

const supabase = useSupabaseClient();

const allClients = ref<any[]>([]);
const allServices = ref<any[]>([]);

onMounted(async () => {
  await fetchClients();
  await fetchServices();

  allClients.value = [...clients.value];
  allServices.value = [...services.value];

  if (!props.appointment) return;

  if (props.appointment.client_id) {
    const existingClient = allClients.value.find(
      (c) => c.id === props.appointment!.client_id,
    );

    if (!existingClient || !existingClient.is_active) {
      const { data: clientData } = await supabase
        .from("clients")
        .select("id, name, phone, is_active")
        .eq("id", props.appointment.client_id)
        .single();

      if (clientData && !allClients.value.find((c) => c.id === clientData.id)) {
        allClients.value.push(clientData);
      }
    }
  }

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

const clientOptions = computed(() => {
  return allClients.value.map((c) => ({
    label: c.is_active ? c.name : `${c.name} (eliminado)`,
    value: c.id,
    disabled: !c.is_active && c.id !== props.appointment?.client_id,
  }));
});

const serviceOptions = computed(() => {
  return allServices.value.map((s) => ({
    label: s.is_active
      ? `${s.name} - $${s.price}`
      : `${s.name} - $${s.price} (eliminado)`,
    value: s.id,
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
      <USelect
        v-model="state.client_id"
        :items="clientOptions"
        placeholder="Selecciona un cliente"
        class="w-full"
      />
    </UFormField>

    <UFormField name="service_id" label="Servicio" class="col-span-2">
      <USelect
        v-model="state.service_id"
        :items="serviceOptions"
        placeholder="Selecciona un servicio"
        class="w-full"
      />
    </UFormField>

    <UFormField name="date" label="Fecha y hora" required class="col-span-2">
      <UInput v-model="state.date" type="datetime-local" class="w-full" />
    </UFormField>

    <UFormField name="duration_minutes" label="Duración (min)" required>
      <UInput
        v-model.number="state.duration_minutes"
        type="number"
        min="1"
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
