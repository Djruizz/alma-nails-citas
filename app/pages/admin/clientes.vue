<script setup lang="ts">
definePageMeta({ layout: "default" });

const { clients, status, refresh, fetchClients } = useClients();
await fetchClients();
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
        <UButton icon="i-lucide-user-plus" label="Nuevo" size="md" />
      </template>
    </AppPageHeader>

    <ClientList :clients="clients" :loading="status === 'pending'" />
  </div>
</template>
