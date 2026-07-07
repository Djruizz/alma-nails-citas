<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { Tables } from "~/types/database.types";
import { clientSchema, type ClientSchema } from "~/schemas/clients";

const props = defineProps<{
  client?: Tables<"clients">;
}>();

const emit = defineEmits<{
  submit: [payload: ClientSchema];
  cancel: [];
}>();

const state = reactive<ClientSchema>({
  name: "",
  phone: "",
  client_since: "",
  notes: "",
});

const formRef = useTemplateRef<{ clearErrors: () => void }>("formRef");

watch(
  () => props.client,
  (val) => {
    state.name = val?.name ?? "";
    state.phone = val?.phone ?? "";
    state.client_since = val?.client_since ?? "";
    state.notes = val?.notes ?? "";
    formRef.value?.clearErrors();
  },
  { immediate: true },
);

function onSubmit(event: FormSubmitEvent<ClientSchema>) {
  emit("submit", {
    name: event.data.name.trim(),
    phone: event.data.phone?.trim(),
    client_since: event.data.client_since?.trim() || undefined,
    notes: event.data.notes?.trim(),
  });
}
</script>

<template>
  <UForm
    id="client-form"
    ref="formRef"
    :schema="clientSchema"
    :state="state"
    class="grid grid-cols-2 gap-4"
    @submit="onSubmit"
  >
    <UFormField name="name" label="Nombre" required class="col-span-2">
      <UInput
        v-model="state.name"
        placeholder="Nombre del cliente"
        class="w-full"
      />
    </UFormField>

    <UFormField name="phone" label="Teléfono">
      <UInput v-model="state.phone" placeholder="Teléfono" class="w-full" />
    </UFormField>
    <UFormField name="client_since" label="Cliente desde:">
      <UInput
        v-model="state.client_since"
        placeholder="Fecha de registro"
        class="w-full"
        type="date"
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
