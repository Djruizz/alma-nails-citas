<script setup lang="ts">
import type { Tables } from "~/types/database.types";

definePageMeta({ layout: "default" });

const {
  appointments,
  status,
  hasMore,
  isLoadingMore,
  currentFilter,
  refresh,
  fetchAppointments,
  loadMore,
  setFilter,
} = useAppointments();

type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "REMEMBER";

const selectedStatus = ref<StatusFilter>(currentFilter.value);

watch(selectedStatus, (newStatus) => {
  setFilter(newStatus);
});

onMounted(() => {
  fetchAppointments(selectedStatus.value);
});

const modal = reactive({
  open: false,
  mode: "create" as "create" | "edit",
  appointment: null as AppointmentWithRelations | null,
});

const detailModal = reactive({
  open: false,
  appointment: null as AppointmentWithRelations | null,
});

const deleteModal = reactive({
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

function openDetail(appointment: AppointmentWithRelations) {
  detailModal.appointment = appointment;
  detailModal.open = true;
}

function openDelete(appointment: AppointmentWithRelations) {
  deleteModal.appointment = appointment;
  deleteModal.open = true;
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
      @detail="openDetail"
      @delete="openDelete"
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

    <AppointmentDetailModal
      v-model:open="detailModal.open"
      :appointment="detailModal.appointment ?? undefined"
    />

    <AppointmentDeleteModal
      v-model:open="deleteModal.open"
      :appointment="deleteModal.appointment ?? undefined"
    />
  </div>
</template>
