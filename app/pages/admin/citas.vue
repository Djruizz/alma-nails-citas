<script setup lang="ts">
import type { Tables } from "~/types/database.types";

definePageMeta({ layout: "default" });

const {
  appointments,
  status,
  hasMore,
  isLoadingMore,
  refresh,
  fetchAppointments,
  loadMore,
  setFilter,
} = useAppointments();

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED";

const selectedStatus = ref<StatusFilter>("ALL");

watch(selectedStatus, (newStatus) => {
  setFilter(newStatus);
});

onMounted(() => {
  fetchAppointments();
});

const modal = reactive({
  open: false,
  mode: "create" as "create" | "edit",
  appointment: null as AppointmentWithRelations | null,
});

const cancelModal = reactive({
  open: false,
  appointment: null as AppointmentWithRelations | null,
});

function openCreate() {
  modal.mode = "create";
  modal.appointment = null;
  modal.open = true;
}

function openEdit(appointment: AppointmentWithRelations) {
  modal.mode = "edit";
  modal.appointment = appointment;
  modal.open = true;
}

function openCancel(appointment: AppointmentWithRelations) {
  cancelModal.appointment = appointment;
  cancelModal.open = true;
}
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6">
    <AppPageHeader
      title="Citas"
      description="Gestiona las citas de tus clientes"
      icon="i-lucide-calendar-check"
    >
      <template #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="ghost"
          color="neutral"
          size="md"
          :ui="{
            leadingIcon:
              status === 'pending' ? 'animate-spin duration-200' : '',
          }"
          @click="refresh()"
        />
        <UButton
          icon="i-lucide-plus"
          label="Nueva cita"
          size="md"
          @click="openCreate"
        />
      </template>
    </AppPageHeader>

    <AppointmentStatusFilter v-model="selectedStatus" />

    <AppointmentList
      :appointments="appointments"
      :loading="status === 'pending'"
      @edit="openEdit"
      @cancel="openCancel"
    />

    <div v-if="hasMore" class="flex items-center justify-center py-4">
      <UButton
        label="Cargar más"
        color="neutral"
        variant="soft"
        :loading="isLoadingMore"
        @click="loadMore"
      />
    </div>

    <AppointmentModal
      v-model:open="modal.open"
      :mode="modal.mode"
      :appointment="modal.appointment ?? undefined"
    />

    <AppointmentDeleteModal
      v-model:open="cancelModal.open"
      :appointment="cancelModal.appointment ?? undefined"
    />
  </div>
</template>
