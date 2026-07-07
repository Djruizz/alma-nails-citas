<script setup lang="ts">
import type { Tables } from "~/types/database.types";

definePageMeta({ layout: "default" });

const { clients, status, refresh, fetchClients } = useClients();
await fetchClients();

type Client = Tables<"clients">;

const modal = reactive({
  open: false,
  mode: "create" as "create" | "edit",
  client: null as Client | null,
});

const deleteModal = reactive({
  open: false,
  client: null as Client | null,
});

function openCreate() {
  modal.mode = "create";
  modal.client = null;
  modal.open = true;
}

function openEdit(client: Client) {
  modal.mode = "edit";
  modal.client = client;
  modal.open = true;
}

function openDelete(client: Client) {
  deleteModal.client = client;
  deleteModal.open = true;
}
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6">
    <AppPageHeader
      title="Clientes"
      description="Gestiona tus clientes y sus datos"
      icon="i-lucide-users"
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
          icon="i-lucide-user-plus"
          label="Nuevo"
          size="md"
          @click="openCreate"
        />
      </template>
    </AppPageHeader>

    <ClientList
      :clients="clients"
      :loading="status === 'pending'"
      @edit="openEdit"
      @delete="openDelete"
    />

    <ClientModal
      v-model:open="modal.open"
      :mode="modal.mode"
      :client="modal.client ?? undefined"
    />

    <ClientDeleteModal
      v-model:open="deleteModal.open"
      :client="deleteModal.client ?? undefined"
    />
  </div>
</template>
