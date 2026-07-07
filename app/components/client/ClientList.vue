<script setup lang="ts">
import type { Tables } from "~/types/database.types";

const props = defineProps<{
  clients: Tables<"clients">[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  edit: [client: Tables<"clients">];
  delete: [client: Tables<"clients">];
}>();

const clientsDummys = [
  {
    id: "25b979a8-4045-40eb-b060-689aa9e22703",
    professional_id: "8be08f05-4305-421a-aad6-a2db3a025f3e",
    name: "Dario cliente",
    phone: "123123123",
    notes: "Notas",
    created_at: "2026-07-07T06:00:49.760232+00:00",
    updated_at: "2026-07-07T06:00:49.760232+00:00",
  },
  {
    id: "25b979a8-4045-40eb-b060-689aa9e22703",
    professional_id: "8be08f05-4305-421a-aad6-a2db3a025f3e",
    name: "Dario cliente",
    phone: "123123123",
    notes: "Notas",
    created_at: "2026-07-07T06:00:49.760232+00:00",
    updated_at: "2026-07-07T06:00:49.760232+00:00",
  },
  {
    id: "25b979a8-4045-40eb-b060-689aa9e22703",
    professional_id: "8be08f05-4305-421a-aad6-a2db3a025f3e",
    name: "Dario cliente",
    phone: "123123123",
    notes: "Notas",
    created_at: "2026-07-07T06:00:49.760232+00:00",
    updated_at: "2026-07-07T06:00:49.760232+00:00",
  },
  {
    id: "25b979a8-4045-40eb-b060-689aa9e22703",
    professional_id: "8be08f05-4305-421a-aad6-a2db3a025f3e",
    name: "Dario cliente",
    phone: "123123123",
    notes: "Notas",
    created_at: "2026-07-07T06:00:49.760232+00:00",
    updated_at: "2026-07-07T06:00:49.760232+00:00",
  },
  {
    id: "25b979a8-4045-40eb-b060-689aa9e22703",
    professional_id: "8be08f05-4305-421a-aad6-a2db3a025f3e",
    name: "Dario cliente",
    phone: "123123123",
    notes: "Notas",
    created_at: "2026-07-07T06:00:49.760232+00:00",
    updated_at: "2026-07-07T06:00:49.760232+00:00",
  },
  {
    id: "25b979a8-4045-40eb-b060-689aa9e22703",
    professional_id: "8be08f05-4305-421a-aad6-a2db3a025f3e",
    name: "Dario cliente",
    phone: "123123123",
    notes: "Notas",
    created_at: "2026-07-07T06:00:49.760232+00:00",
    updated_at: "2026-07-07T06:00:49.760232+00:00",
  },
  {
    id: "25b979a8-4045-40eb-b060-689aa9e22703",
    professional_id: "8be08f05-4305-421a-aad6-a2db3a025f3e",
    name: "Dario cliente",
    phone: "123123123",
    notes: "Notas",
    created_at: "2026-07-07T06:00:49.760232+00:00",
    updated_at: "2026-07-07T06:00:49.760232+00:00",
  },
];
</script>

<template>
  <div v-if="loading" class="grid gap-4">
    <USkeleton v-for="i in 3" :key="i" class="h-24 rounded-xl" />
  </div>

  <div
    v-else-if="clients.length === 0"
    class="flex flex-col items-center justify-center gap-3 py-20"
  >
    <div class="flex items-center justify-center size-16 rounded-2xl bg-muted">
      <UIcon name="i-lucide-users" class="size-8 text-dimmed" />
    </div>
    <p class="text-muted text-sm">Aún no tienes clientes registrados</p>
  </div>

  <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <ClientCard
      v-for="client in clients"
      :key="client.id"
      :client="client"
      show-actions
      @edit="emit('edit', $event)"
      @delete="emit('delete', $event)"
    />
  </div>
</template>
