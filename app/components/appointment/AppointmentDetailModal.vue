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
  restoreAppointment,
  remindViaWhatsApp,
} = useAppointments();
const {
  getStatusColor,
  getStatusLabel,
  getStatusIcon,
  canCancel,
  canConfirm,
  canComplete,
  canRemind,
  canRestore,
} = useAppointmentStatus();
const { formatDate, formatTime } = useDateUtils();
const toast = useToast();

const completing = ref(false);
const canceling = ref(false);
const confirming = ref(false);
const restoring = ref(false);

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

async function onRestore() {
  if (!props.appointment) return;
  restoring.value = true;
  try {
    await restoreAppointment(props.appointment.id);
    toast.add({
      title: "Cita recuperada",
      description: "La cita ha sido restaurada como pendiente",
      color: "success",
      icon: "i-lucide-rotate-ccw",
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
    restoring.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="clientName"
    :description="serviceName"
    :ui="{ footer: 'justify-between' }"
    :close-button="true"
  >
    <template #header="{ close }">
      <div v-if="appointment" class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3 min-w-0">
          <div
            class="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0"
          >
            <UIcon name="i-lucide-user" class="size-5" />
          </div>
          <div class="min-w-0">
            <p class="text-base font-semibold text-highlighted truncate">
              {{ clientName }}
            </p>
            <p class="text-sm text-muted truncate">{{ serviceName }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <UBadge
            :color="statusColor"
            size="sm"
            variant="subtle"
            class="gap-1.5 shrink-0"
          >
            <UIcon :name="statusIcon" class="size-3.5" />
            {{ statusLabel }}
          </UBadge>
          <UButton
            :icon="'i-lucide-x'"
            variant="link"
            color="neutral"
            size="md"
            @click="close()"
          />
        </div>
      </div>
    </template>

    <template #body>
      <div v-if="appointment" class="space-y-5 py-1">
        <div v-if="!showCompleteForm">
          <div class="space-y-4">
            <div class="grid grid-cols-3 gap-3">
              <div
                class="flex items-center col-span-2 gap-3 p-3 rounded-lg bg-muted/50 border border-muted"
              >
                <div
                  class="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0"
                >
                  <UIcon name="i-lucide-calendar-days" class="size-4.5" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-muted">Fecha</p>
                  <p class="text-sm font-medium text-highlighted truncate">
                    {{ formattedDate }}
                  </p>
                </div>
              </div>

              <div
                class="flex items-center col-span-1 gap-3 p-3 rounded-lg bg-muted/50 border border-muted"
              >
                <div
                  class="flex items-center justify-center size-9 rounded-lg bg-primary/10 text-primary shrink-0"
                >
                  <UIcon name="i-lucide-clock" class="size-4.5" />
                </div>
                <div class="min-w-0">
                  <p class="text-xs text-muted">Hora</p>
                  <p class="text-sm font-medium text-highlighted">
                    {{ formattedTime }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="clientPhone"
              class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-muted"
            >
              <div
                class="flex items-center justify-center size-9 rounded-lg bg-info/10 text-info shrink-0"
              >
                <UIcon name="i-lucide-phone" class="size-4.5" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-muted">Telefono</p>
                <p class="text-sm font-medium text-highlighted">
                  {{ clientPhone }}
                </p>
              </div>
            </div>

            <div
              v-if="displayPrice != null"
              class="flex items-center gap-3 p-3 rounded-lg bg-success/5 border border-success/20"
            >
              <div
                class="flex items-center justify-center size-9 rounded-lg bg-success/10 text-success shrink-0"
              >
                <UIcon name="i-lucide-dollar-sign" class="size-4.5" />
              </div>
              <div class="min-w-0">
                <p class="text-xs text-muted">Precio cobrado</p>
                <p class="text-lg font-bold text-success">
                  ${{ displayPrice }}
                </p>
              </div>
            </div>

            <div
              v-if="appointment.notes"
              class="p-3 rounded-lg bg-muted/50 border border-muted"
            >
              <div class="flex items-center gap-2 mb-2">
                <UIcon
                  name="i-lucide-file-text"
                  class="size-4 text-muted shrink-0"
                />
                <p
                  class="text-xs text-muted font-medium uppercase tracking-wide"
                >
                  Notas
                </p>
              </div>
              <p class="text-sm text-default leading-relaxed">
                {{ appointment.notes }}
              </p>
            </div>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div
            class="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border border-muted"
          >
            <UIcon name="i-lucide-info" class="size-4 text-muted shrink-0" />
            <p class="text-sm text-muted">
              Ingresa el precio final y las observaciones del servicio.
            </p>
          </div>

          <UFormField label="Precio final cobrado" required>
            <UInput
              v-model.number="completePrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              size="lg"
              icon="i-lucide-dollar-sign"
              class="w-full"
            />
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

    <template #footer v-if="appointment">
      <div class="flex gap-2 w-full">
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
            v-if="canRestore(appointment.status)"
            label="Recuperar"
            icon="i-lucide-rotate-ccw"
            color="success"
            variant="soft"
            :loading="restoring"
            @click="onRestore"
          />

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
