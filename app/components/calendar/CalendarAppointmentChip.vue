<script setup lang="ts">
import type { Tables } from "~/types/database.types";

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

const props = defineProps<{
  appointment: AppointmentWithRelations;
}>();

const emit = defineEmits<{
  click: [appointment: AppointmentWithRelations];
}>();

const { getStatusColor } = useAppointmentStatus();
const { formatTime } = useDateUtils();

const color = computed(() => getStatusColor(props.appointment.status));
const time = computed(() => formatTime(props.appointment.date));
const clientName = computed(
  () => props.appointment.clients?.name || "Sin cliente",
);
</script>

<template>
  <UBadge
    :color="color"
    variant="subtle"
    size="sm"
    class="cursor-pointer hover:opacity-80 transition-opacity truncate"
  >
    <span class="truncate">{{ time }} {{ clientName }}</span>
  </UBadge>
</template>
