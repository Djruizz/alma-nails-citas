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

const {
  confirmAppointment,
  completeAppointment,
  cancelAppointment,
  remindViaWhatsApp,
  refresh,
} = useAppointments();
const {
  getStatusColor,
  getStatusLabel,
  getStatusIcon,
  canCancel,
  canConfirm,
  canComplete,
  canRemind,
} = useAppointmentStatus();
const { formatDate, formatTime } = useDateUtils();
const toast = useToast();

const completing = ref(false);
const canceling = ref(false);
const confirming = ref(false);

const showCompleteForm = ref(false);
const completePrice = ref(0);
const completeNotes = ref("");

const clientName = computed(
  () => props.appointment?.clients?.name || "Sin cliente",
);
const clientPhone = computed(() => props.appointment?.clients?.phone);
const serviceName = computed(
  () => props.appointment?.services?.name || "Sin servicio",
);

const formattedDate = computed(() => {
  if (!props.appointment) return "";
  return formatDate(props.appointment.date, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

const formattedTime = computed(() => {
  if (!props.appointment) return "";
  return formatTime(props.appointment.date, {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const statusColor = computed(() => {
  if (!props.appointment) return "neutral";
  return getStatusColor(props.appointment.status);
});

const statusLabel = computed(() => {
  if (!props.appointment) return "";
  return getStatusLabel(props.appointment.status);
});

const statusIcon = computed(() => {
  if (!props.appointment) return "i-lucide-help-circle";
  return getStatusIcon(props.appointment.status);
});

const displayPrice = computed(() => {
  if (
    props.appointment?.status === "COMPLETED" &&
    props.appointment.price != null
  ) {
    return props.appointment.price.toFixed(2);
  }
  return null;
});

watch(
  () => props.appointment,
  (apt) => {
    if (apt) {
      const servicePrice = apt.services?.price ?? 0;
      completePrice.value = servicePrice >= 0 ? servicePrice : 0;
      completeNotes.value = apt.notes ?? "";
      showCompleteForm.value = false;
    }
  },
  { immediate: true },
);

async function onConfirm() {
  if (!props.appointment) return;
  confirming.value = true;
  try {
    await confirmAppointment(props.appointment.id);
    await refresh();
    toast.add({
      title: "Cita confirmada",
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
    confirming.value = false;
  }
}

async function onComplete() {
  if (!props.appointment) return;
  if (isNaN(completePrice.value) || completePrice.value < 0) {
    toast.add({
      title: "Precio inválido",
      description: "El precio debe ser un número mayor o igual a cero",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
    return;
  }

  completing.value = true;
  try {
    await completeAppointment(props.appointment.id, {
      price: completePrice.value,
      notes: completeNotes.value,
    });
    await refresh();
    toast.add({
      title: "Cita completada",
      color: "success",
      icon: "i-lucide-check-check",
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
    completing.value = false;
  }
}

async function onCancel() {
  if (!props.appointment) return;
  canceling.value = true;
  try {
    await cancelAppointment(props.appointment.id);
    await refresh();
    toast.add({
      title: "Cita cancelada",
      color: "success",
      icon: "i-lucide-x-circle",
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

function onRemind() {
  if (!props.appointment) return;
  try {
    remindViaWhatsApp(props.appointment);
    toast.add({
      title: "Recordatorio enviado",
      description: "Se abrió WhatsApp para enviar el recordatorio",
      color: "success",
      icon: "i-lucide-message-circle",
    });
  } catch (err: any) {
    toast.add({
      title: "No se puede enviar recordatorio",
      description: err?.message || "El cliente no tiene número de teléfono",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

function startComplete() {
  showCompleteForm.value = true;
}

function backToDetail() {
  showCompleteForm.value = false;
}
</script>

<template>
  <UModal v-model:open="open" :ui="{ footer: 'justify-end' }">
    <template #header>
      <div v-if="appointment" class="flex items-center gap-3">
        <UBadge :color="statusColor" size="sm" variant="subtle" class="gap-1.5">
          <UIcon :name="statusIcon" class="size-4" />
          {{ statusLabel }}
        </UBadge>
      </div>
    </template>

    <template #body>
      <div v-if="appointment" class="space-y-4 py-2">
        <div v-if="!showCompleteForm">
          <div class="p-4 rounded-lg bg-muted/50 space-y-3">
            <div>
              <p class="text-xs text-muted mb-1">Cliente</p>
              <p class="text-base font-semibold text-highlighted">
                {{ clientName }}
              </p>
              <p v-if="clientPhone" class="text-sm text-muted mt-0.5">
                {{ clientPhone }}
              </p>
            </div>

            <div>
              <p class="text-xs text-muted mb-1">Servicio</p>
              <p class="text-sm font-medium text-highlighted">
                {{ serviceName }}
              </p>
            </div>

            <div class="flex items-center gap-4">
              <div>
                <p class="text-xs text-muted mb-1">Fecha</p>
                <p class="text-sm text-highlighted">{{ formattedDate }}</p>
              </div>
              <div>
                <p class="text-xs text-muted mb-1">Hora</p>
                <p class="text-sm text-highlighted">{{ formattedTime }}</p>
              </div>
            </div>

            <div v-if="displayPrice != null">
              <p class="text-xs text-muted mb-1">Precio cobrado</p>
              <p class="text-lg font-bold text-success">${{ displayPrice }}</p>
            </div>

            <div v-if="appointment.notes">
              <p class="text-xs text-muted mb-1">Notas</p>
              <p class="text-sm text-highlighted">{{ appointment.notes }}</p>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <UFormField label="Precio final cobrado" required>
            <UInput
              v-model.number="completePrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              size="lg"
              class="w-full"
            >
              <template #leading>
                <span class="text-muted font-medium">$</span>
              </template>
            </UInput>
          </UFormField>

          <UFormField label="Notas de la cita">
            <UTextarea
              v-model="completeNotes"
              placeholder="Observaciones sobre el servicio realizado..."
              :rows="3"
              autoresize
              class="w-full"
            />
          </UFormField>
        </div>
      </div>
    </template>

    <template #footer>
      <div v-if="appointment" class="flex gap-2 w-full">
        <template v-if="!showCompleteForm">
          <UButton
            v-if="canRemind(appointment.status)"
            label="Recordar"
            icon="i-lucide-message-circle"
            color="success"
            variant="soft"
            @click="onRemind"
          />

          <div class="flex-1" />

          <UButton
            v-if="canCancel(appointment.status)"
            label="Cancelar"
            icon="i-lucide-x-circle"
            color="error"
            variant="soft"
            :loading="canceling"
            @click="onCancel"
          />

          <UButton
            v-if="canConfirm(appointment.status)"
            label="Confirmar"
            icon="i-lucide-check-circle"
            color="info"
            :loading="confirming"
            @click="onConfirm"
          />

          <UButton
            v-if="canComplete(appointment.status, appointment.date)"
            label="Completar"
            icon="i-lucide-check-check"
            color="success"
            @click="startComplete"
          />
        </template>

        <template v-else>
          <UButton
            label="Volver"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            @click="backToDetail"
          />
          <div class="flex-1" />
          <UButton
            label="Completar cita"
            icon="i-lucide-check-check"
            color="success"
            :loading="completing"
            @click="onComplete"
          />
        </template>
      </div>
    </template>
  </UModal>
</template>
