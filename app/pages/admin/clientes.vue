<script setup lang="ts">
import type { Tables } from "~/types/database.types";

definePageMeta({ layout: "default" });

const {
  pagedClients,
  pagedStatus,
  hasMoreClients,
  clientSearch,
  clientSort,
  fetchClientsPage,
  loadMoreClients,
} = useClients();

onMounted(() => {
  fetchClientsPage({ reset: true });
});

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

function onSearch(value: string) {
  clientSearch.value = value;
  fetchClientsPage({ reset: true });
}

function onSort(value: "asc" | "desc") {
  clientSort.value = value;
  fetchClientsPage({ reset: true });
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
              pagedStatus === 'pending' ? 'animate-spin duration-200' : '',
          }"
          @click="fetchClientsPage({ reset: true })"
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
      :clients="pagedClients"
      :loading="pagedStatus === 'pending' && pagedClients.length === 0"
      :loading-more="pagedStatus === 'pending' && pagedClients.length > 0"
      :has-more="hasMoreClients"
      @edit="openEdit"
      @delete="openDelete"
      @load-more="loadMoreClients"
      @search="onSearch"
      @sort="onSort"
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