<script setup lang="ts">
import type { Tables } from '~/types/database.types'

const props = defineProps<{
  clients: Tables<'clients'>[]
  loading?: boolean
}>()
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

  <div v-else class="grid gap-4">
    <ClientCard
      v-for="client in clients"
      :key="client.id"
      :client="client"
    />
  </div>
</template>
