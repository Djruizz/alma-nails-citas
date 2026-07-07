<script setup lang="ts">
import type { Tables } from "~/types/database.types";
import type { DropdownMenuItem } from "@nuxt/ui";

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

const props = defineProps<{
  appointment: AppointmentWithRelations;
  showActions?: boolean;
}>();

const emit = defineEmits<{
  edit: [appointment: AppointmentWithRelations];
  cancel: [appointment: AppointmentWithRelations];
}>();

const clientName = computed(
  () => props.appointment.clients?.name || "Sin cliente",
);

const serviceName = computed(
  () => props.appointment.services?.name || "Sin servicio",
);

const formattedDate = computed(() => {
  const date = new Date(props.appointment.date);
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

const formattedTime = computed(() => {
  const date = new Date(props.appointment.date);
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const statusColor = computed(() => {
  switch (props.appointment.status) {
    case "PENDING":
      return "warning";
    case "CONFIRMED":
      return "info";
    case "COMPLETED":
      return "success";
    case "CANCELED":
      return "error";
    default:
      return "neutral";
  }
});

const statusLabel = computed(() => {
  switch (props.appointment.status) {
    case "PENDING":
      return "Pendiente";
    case "CONFIRMED":
      return "Confirmada";
    case "COMPLETED":
      return "Completada";
    case "CANCELED":
      return "Cancelada";
    default:
      return props.appointment.status;
  }
});

const statusIcon = computed(() => {
  switch (props.appointment.status) {
    case "PENDING":
      return "i-lucide-clock";
    case "CONFIRMED":
      return "i-lucide-check-circle";
    case "COMPLETED":
      return "i-lucide-check-check";
    case "CANCELED":
      return "i-lucide-x-circle";
    default:
      return "i-lucide-help-circle";
  }
});

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: "Editar",
      icon: "i-lucide-pencil",
      onSelect: () => emit("edit", props.appointment),
    },
    {
      label: "Cancelar cita",
      icon: "i-lucide-x-circle",
      color: "error",
      onSelect: () => emit("cancel", props.appointment),
    },
  ],
]);
</script>

<template>
  <UCard class="overflow-hidden w-full" variant="subtle" :ui="{ body: 'p-4' }">
    <div class="flex justify-between items-start gap-4">
      <div class="flex items-start gap-4 flex-1 min-w-0">
        <div
          class="flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary shrink-0"
        >
          <UIcon name="i-lucide-calendar" class="size-6" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1">
            <p class="text-sm font-semibold text-highlighted truncate">
              {{ clientName }}
            </p>
            <UBadge
              :color="statusColor"
              size="xs"
              variant="subtle"
              class="gap-1"
            >
              <UIcon :name="statusIcon" class="size-3" />
              {{ statusLabel }}
            </UBadge>
          </div>
          <p class="text-sm text-muted truncate">{{ serviceName }}</p>
          <div class="flex items-center gap-3 mt-2">
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-clock"
                class="size-3.5 text-muted shrink-0"
              />
              <p class="text-xs text-muted">{{ formattedTime }}</p>
            </div>
            <div class="flex items-center gap-1.5">
              <UIcon
                name="i-lucide-calendar-days"
                class="size-3.5 text-muted shrink-0"
              />
              <p class="text-xs text-muted">{{ formattedDate }}</p>
            </div>
          </div>
        </div>
      </div>
      <UDropdownMenu v-if="showActions" :items="items">
        <UButton
          icon="i-lucide-ellipsis-vertical"
          size="sm"
          variant="link"
          color="neutral"
          class="cursor-pointer shrink-0"
        />
      </UDropdownMenu>
    </div>

    <div v-if="appointment.notes" class="mt-3 pt-3 border-t border-default">
      <p class="text-xs text-dimmed line-clamp-2">
        {{ appointment.notes }}
      </p>
    </div>
  </UCard>
</template>
