<script setup lang="ts">
import type { AppointmentSchema } from "~/schemas/appointments";
import type { Tables } from "~/types/database.types";

const props = defineProps<{
  mode?: "create" | "edit";
  appointment?: Tables<"appointments">;
}>();

const open = defineModel<boolean>("open", { default: false });

const { createAppointment, updateAppointment } = useAppointments();
const user = useSupabaseUser();
const toast = useToast();

const saving = ref(false);

async function onSubmit(payload: AppointmentSchema) {
  saving.value = true;
  try {
    if (props.mode === "edit" && props.appointment) {
      await updateAppointment(props.appointment.id, payload);
      toast.add({
        title: "Cita actualizada",
        color: "success",
        icon: "i-lucide-check-circle",
      });
    } else {
      const professionalId = user.value?.sub;
      if (!professionalId)
        throw new Error("No se pudo obtener el usuario autenticado");
      await createAppointment({
        ...payload,
        professional_id: professionalId,
        status: "PENDING",
        updated_at: new Date().toISOString(),
      });
      toast.add({
        title: "Cita creada",
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
    :title="mode === 'edit' ? 'Editar cita' : 'Nueva cita'"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <AppointmentForm :appointment="appointment" @submit="onSubmit" />
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
        form="appointment-form"
        label="Guardar"
        color="primary"
        :loading="saving"
      />
    </template>
  </UModal>
</template>
