<script setup lang="ts">
import type { Tables } from "~/types/database.types";

definePageMeta({ layout: "default" });

const { services, status, refresh, fetchServices } = useServices();
onMounted(() => {
  fetchServices();
});

type Service = Tables<"services">;

const modal = reactive({
  open: false,
  mode: "create" as "create" | "edit",
  service: null as Service | null,
});

const deleteModal = reactive({
  open: false,
  service: null as Service | null,
});

function openCreate() {
  modal.mode = "create";
  modal.service = null;
  modal.open = true;
}

function openEdit(service: Service) {
  modal.mode = "edit";
  modal.service = service;
  modal.open = true;
}

function openDelete(service: Service) {
  deleteModal.service = service;
  deleteModal.open = true;
}
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6">
    <AppPageHeader
      title="Servicios"
      description="Administra tus servicios"
      icon="i-lucide-scissors"
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
          label="Nuevo"
          size="md"
          @click="openCreate"
        />
      </template>
    </AppPageHeader>

    <ServiceList
      :services="services"
      :loading="status === 'pending'"
      @edit="openEdit"
      @delete="openDelete"
    />

    <ServiceModal
      v-model:open="modal.open"
      :mode="modal.mode"
      :service="modal.service ?? undefined"
    />

    <ServiceDeleteModal
      v-model:open="deleteModal.open"
      :service="deleteModal.service ?? undefined"
    />
  </div>
</template>
