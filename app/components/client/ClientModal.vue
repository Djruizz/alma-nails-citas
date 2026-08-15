<script setup lang="ts">
import type { ClientSchema } from "~/schemas/clients";
import type { Tables } from "~/types/database.types";

const props = defineProps<{
  mode?: "create" | "edit";
  client?: Tables<"clients">;
}>();

const emit = defineEmits<{
  saved: [client: Tables<"clients">];
}>();

const open = defineModel<boolean>("open", { default: false });

const { createClient, updateClient } = useClients();
const { syncClientInAppointments } = useAppointments();
const user = useSupabaseUser();
const toast = useToast();

const saving = ref(false);

async function onSubmit(payload: ClientSchema) {
  saving.value = true;
  try {
    let saved: Tables<"clients"> | null = null;
    if (props.mode === "edit" && props.client) {
      saved = await updateClient(props.client.id, payload);
      toast.add({
        title: "Cliente actualizado",
        description: payload.name,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } else {
      const professionalId = user.value?.sub;
      if (!professionalId)
        throw new Error("No se pudo obtener el usuario autenticado");
      saved = await createClient({
        ...payload,
        professional_id: professionalId,
        updated_at: new Date().toISOString(),
      });
      toast.add({
        title: "Cliente creado",
        description: payload.name,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    }
    if (saved) {
      emit("saved", saved);
      syncClientInAppointments(saved);
    }
    open.value = false;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="mode === 'edit' ? 'Editar cliente' : 'Nuevo cliente'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <ClientForm :client="client" @submit="onSubmit" />
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        @click="close"
      />
      <UButton
        type="submit"
        form="client-form"
        label="Guardar"
        color="primary"
        :loading="saving"
      />
    </template>
  </UModal>
</template>
