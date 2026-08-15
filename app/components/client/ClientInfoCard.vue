<script setup lang="ts">
import type { Tables } from "~/types/database.types";

const props = defineProps<{
  client?: Tables<"clients"> | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  delete: [];
}>();

const { formatDate } = useDateUtils();

const initials = computed(() => {
  const name = props.client?.name;
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});

const clientSinceLabel = computed(() => {
  const since = props.client?.client_since;
  if (!since) return null;
  return formatDate(since, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

function openWhatsApp() {
  const phone = props.client?.phone;
  if (!phone) return;
  const name = props.client?.name || "Cliente";
  const message = `Hola ${name}! Saludos desde Alma Nails. ¿En qué podemos ayudarte? 💅`;
  const cleanPhone = phone.replace(/\D/g, "");
  window.open(
    `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
    "_blank",
  );
}
</script>

<template>
  <UCard variant="subtle" :ui="{ body: 'p-4 sm:p-6' }">
    <div v-if="loading" class="flex items-center gap-4">
      <USkeleton class="size-16 rounded-full shrink-0" />
      <div class="space-y-2 flex-1">
        <USkeleton class="h-5 w-40" />
        <USkeleton class="h-4 w-32" />
      </div>
    </div>

    <div v-else-if="client" class="flex flex-col gap-4">
      <div class="flex items-start gap-4">
        <UAvatar
          :text="initials"
          size="xl"
          class="bg-primary/10 text-primary shrink-0"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="text-lg font-bold text-highlighted truncate">
              {{ client.name }}
            </p>
            <UBadge
              :color="client.is_active ? 'success' : 'neutral'"
              size="sm"
              variant="subtle"
              :label="client.is_active ? 'Activa' : 'Inactiva'"
            />
          </div>

          <div class="flex items-center gap-4 mt-2 flex-wrap text-muted">
            <button
              v-if="client.phone"
              type="button"
              class="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
              :title="`Enviar WhatsApp a ${client.phone}`"
              @click="openWhatsApp"
            >
              <UIcon name="i-lucide-phone" class="size-4 shrink-0" />
              <span class="text-sm">{{ client.phone }}</span>
            </button>
            <div v-if="clientSinceLabel" class="flex items-center gap-1.5">
              <UIcon name="i-lucide-calendar" class="size-4 shrink-0" />
              <span class="text-sm">Cliente desde {{ clientSinceLabel }}</span>
            </div>
          </div>

          <UButton
            v-if="client.phone"
            class="mt-3 sm:hidden"
            icon="i-lucide-message-circle"
            color="primary"
            variant="soft"
            label="Enviar WhatsApp"
            size="sm"
            @click="openWhatsApp"
          />
        </div>
        <UButton
          v-if="client.phone"
          icon="i-lucide-message-circle"
          color="primary"
          variant="soft"
          label="WhatsApp"
          size="md"
          class="hidden sm:flex shrink-0"
          @click="openWhatsApp"
        />
      </div>

      <div class="p-3 rounded-lg bg-muted/50 border border-muted">
        <div class="flex items-center gap-2 mb-2">
          <UIcon name="i-lucide-file-text" class="size-4 text-muted shrink-0" />
          <p class="text-xs text-muted font-medium uppercase tracking-wide">
            Notas
          </p>
        </div>
        <p class="text-sm text-default leading-relaxed whitespace-pre-line">
          {{ client.notes || "Sin notas adicionales" }}
        </p>
      </div>

      <div class="flex justify-end pt-1">
        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="sm"
          label="Eliminar cliente"
          @click="emit('delete')"
        />
      </div>
    </div>
  </UCard>
</template>
