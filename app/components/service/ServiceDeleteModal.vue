<script setup lang="ts">
import type { Tables } from "~/types/database.types";

const props = defineProps<{
  service?: Tables<"services">;
}>();

const open = defineModel<boolean>("open", { default: false });

const { deleteService } = useServices();
const toast = useToast();

const deleting = ref(false);

async function onConfirm() {
  if (!props.service) return;
  deleting.value = true;
  try {
    await deleteService(props.service.id);
    toast.add({
      title: "Servicio eliminado",
      description: `${props.service.name} fue eliminado`,
      color: "success",
      icon: "i-lucide-check-circle",
    });
    open.value = false;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Eliminar servicio"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <div
          class="flex items-center justify-center size-16 rounded-full bg-error/10"
        >
          <UIcon name="i-lucide-alert-triangle" class="size-8 text-error" />
        </div>

        <div class="space-y-2">
          <p class="text-base font-semibold text-highlighted">
            ¿Estás seguro de eliminar este servicio?
          </p>
          <p class="text-sm text-muted max-w-sm">
            Esta acción eliminará el servicio permanentemente. No se puede
            deshacer.
          </p>
        </div>

        <div v-if="service" class="w-full text-start">
          <ServiceCard :service="service" />
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        @click="close"
      />
      <UButton
        label="Eliminar"
        color="error"
        icon="i-lucide-trash-2"
        :loading="deleting"
        @click="onConfirm"
      />
    </template>
  </UModal>
</template>
