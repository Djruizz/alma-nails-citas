<script setup lang="ts">
import type { Tables } from "~/types/database.types";

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

const props = defineProps<{
  appointment?: AppointmentWithRelations;
}>();

const open = defineModel<boolean>("open", { default: false });

const { cancelAppointment } = useAppointments();
const toast = useToast();

const canceling = ref(false);

async function onConfirm() {
  if (!props.appointment) return;
  canceling.value = true;
  try {
    await cancelAppointment(props.appointment.id);
    toast.add({
      title: "Cita cancelada",
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
    canceling.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Cancelar cita"
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
            ¿Estás seguro de cancelar esta cita?
          </p>
          <p class="text-sm text-muted max-w-sm">
            Esta acción marcará la cita como cancelada. No se puede deshacer.
          </p>
        </div>

        <div v-if="appointment" class="w-full text-start">
          <AppointmentCard :appointment="appointment" />
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
        label="Cancelar cita"
        color="error"
        icon="i-lucide-x-circle"
        :loading="canceling"
        @click="onConfirm"
      />
    </template>
  </UModal>
</template>
