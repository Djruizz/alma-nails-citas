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
  detail: [appointment: AppointmentWithRelations];
  delete: [appointment: AppointmentWithRelations];
}>();

const { getStatusColor, getStatusIcon, canCancel, canConfirm } =
  useAppointmentStatus();
const { formatDate, formatTime, isWeeksOrMoreAgo, weeksSince } = useDateUtils();
const { followUpViaWhatsApp } = useAppointments();

const clientName = computed(
  () => props.appointment.clients?.name || "Sin cliente",
);

const serviceName = computed(
  () => props.appointment.services?.name || "Sin servicio",
);

const formattedDate = computed(() => {
  return formatDate(props.appointment.date, {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});

const formattedTime = computed(() => {
  return formatTime(props.appointment.date, {
    hour: "2-digit",
    minute: "2-digit",
  });
});

const statusColor = computed(() => {
  return getStatusColor(props.appointment.status);
});

const statusIcon = computed(() => {
  return getStatusIcon(props.appointment.status);
});

const statusIconClasses = computed(() => {
  const map: Record<string, string> = {
    warning: "bg-warning/10 text-warning",
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    error: "bg-error/10 text-error",
    neutral: "bg-neutral/10 text-neutral",
  };
  return map[statusColor.value] || "bg-primary/10 text-primary";
});

const needsFollowUp = computed(() => {
  return (
    props.appointment.status === "COMPLETED" &&
    isWeeksOrMoreAgo(props.appointment.date, 3)
  );
});

const weeksAgoText = computed(() => {
  const weeks = weeksSince(props.appointment.date);
  if (weeks === 3) return "3 semanas";
  return `${weeks} semanas`;
});

const items = computed<DropdownMenuItem[][]>(() => {
  const status = props.appointment.status;
  const menuItems: DropdownMenuItem[][] = [];

  if (status !== "CANCELED" && status !== "COMPLETED") {
    menuItems.push([
      {
        label: "Editar",
        icon: "i-lucide-pencil",
        onSelect: () => emit("edit", props.appointment),
      },
    ]);
  }
  if (needsFollowUp.value && props.appointment.clients?.phone) {
    menuItems.push([
      {
        label: "Seguimiento",
        icon: "i-lucide-message-circle",
        color: "primary",
        onSelect: () => followUpViaWhatsApp(props.appointment),
      },
    ]);
  }
  if (status !== "COMPLETED") {
    menuItems.push([
      {
        label: "Eliminar",
        icon: "i-lucide-trash-2",
        color: "error",
        onSelect: () => emit("delete", props.appointment),
      },
    ]);
  }

  return menuItems;
});

function onCardClick() {
  emit("detail", props.appointment);
}

function onWhatsAppClick(event: Event) {
  event.stopPropagation();
  try {
    followUpViaWhatsApp(props.appointment);
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <UCard
    class="overflow-hidden w-full cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
    variant="subtle"
    :ui="{ body: 'p-4' }"
    @click="onCardClick"
  >
    <div class="flex justify-between items-start gap-4">
      <div class="flex items-start gap-4 flex-1 min-w-0">
        <div
          class="flex items-center justify-center size-12 rounded-xl shrink-0"
          :class="statusIconClasses"
        >
          <UIcon :name="statusIcon" class="size-6" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <p class="text-sm font-semibold text-highlighted truncate">
              {{ clientName }}
            </p>
            <UBadge
              v-if="needsFollowUp"
              size="sm"
              variant="subtle"
              color="primary"
              icon="i-lucide-bell-ring"
              :label="weeksAgoText"
            />
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
      <div class="flex items-center gap-2 shrink-0">
        <UDropdownMenu v-if="showActions && items.length > 0" :items="items">
          <UButton
            icon="i-lucide-ellipsis-vertical"
            size="sm"
            variant="link"
            color="neutral"
            class="cursor-pointer shrink-0"
            @click.stop
          />
        </UDropdownMenu>
      </div>
    </div>
  </UCard>
</template>
