<script setup lang="ts">
import type { ServiceSchema } from "~/schemas/services";
import type { Tables } from "~/types/database.types";

const props = defineProps<{
  mode?: "create" | "edit";
  service?: Tables<"services">;
}>();

const open = defineModel<boolean>("open", { default: false });

const { createService, updateService } = useServices();
const user = useSupabaseUser();
const toast = useToast();

const saving = ref(false);

async function onSubmit(payload: ServiceSchema) {
  saving.value = true;
  try {
    if (props.mode === "edit" && props.service) {
      await updateService(props.service.id, payload);
      toast.add({
        title: "Servicio actualizado",
        description: payload.name,
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } else {
      const professionalId = user.value?.sub;
      if (!professionalId)
        throw new Error("No se pudo obtener el usuario autenticado");
      await createService({ ...payload, professional_id: professionalId });
      toast.add({
        title: "Servicio creado",
        description: payload.name,
        color: "success",
        icon: "i-lucide-check-circle",
      });
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
    :title="mode === 'edit' ? 'Editar servicio' : 'Nuevo servicio'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <ServiceForm :service="service" @submit="onSubmit" />
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
        form="service-form"
        label="Guardar"
        color="primary"
        :loading="saving"
      />
    </template>
  </UModal>
</template>
