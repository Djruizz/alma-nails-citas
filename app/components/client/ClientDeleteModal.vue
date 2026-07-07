<script setup lang="ts">
import type { Tables } from "~/types/database.types";

const props = defineProps<{
  client?: Tables<"clients">;
}>();

const open = defineModel<boolean>("open", { default: false });

const { removeClient } = useClients();
const toast = useToast();

const deleting = ref(false);

const initials = computed(() => {
  if (!props.client?.name) return "";
  return props.client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

async function onConfirm() {
  if (!props.client) return;
  deleting.value = true;
  try {
    await removeClient(props.client.id);
    toast.add({
      title: "Cliente eliminado",
      description: `${props.client.name} fue desactivado`,
      color: "success",
      icon: "i-lucide-check-circle",
    });
    open.value = false;
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  } finally {
    deleting.value = false;
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Eliminar cliente"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="flex flex-col items-center text-center space-y-4 py-4">
        <div
          class="flex items-center justify-center size-16 rounded-full bg-error/10"
        >
          <UIcon name="i-lucide-alert-triangle" class="size-8 text-error" />
        </div>

        <div class="space-y-2">
          <p class="text-base font-semibold text-highlighted">
            ¿Estás seguro de eliminar este cliente?
          </p>
          <p class="text-sm text-muted max-w-sm">
            Esta acción desactivará el cliente y no aparecerá en los listados.
            No se puede deshacer.
          </p>
        </div>

        <!-- <div v-if="client" class="flex items-center gap-3 p-3 rounded-lg bg-muted/50 w-full max-w-sm">
          <UAvatar
            :text="initials"
            size="md"
            class="bg-error/10 text-error shrink-0"
          />
          <div class="min-w-0 flex-1 text-left">
            <p class="text-sm font-semibold text-highlighted truncate">
              {{ client.name }}
            </p>
            <p v-if="client.phone" class="text-xs text-muted truncate">
              {{ client.phone }}
            </p>
          </div>
        </div> -->
        <div v-if="client" class="w-full text-start">
          <ClientCard :client="client" />
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="ghost"
        @click="close"
      />
      <UButton
        label="Eliminar"
        color="error"
        icon="i-lucide-trash-2"
        :loading="deleting"
        @click="onConfirm"
      />
    </template>
  </UModal>
</template>
