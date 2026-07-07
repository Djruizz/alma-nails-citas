<script setup lang="ts">
import { U } from "vue-router/dist/index-BQLwgiyK.js";
import type { Tables } from "~/types/database.types";

const props = defineProps<{
  client: Tables<"clients">;
}>();

const initials = computed(() => {
  return props.client.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
});
</script>

<template>
  <UCard class="overflow-hidden" :ui="{ body: 'p-4' }">
    <div class="flex items-between items-center gap-4">
      <div class="flex items-center gap-4 flex-1 min-w-0">
        <UAvatar
          :text="initials"
          size="md"
          class="bg-primary/10 text-primary shrink-0"
        />

        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-highlighted truncate">
            {{ client.name }}
          </p>
          <div v-if="client.phone" class="flex items-center gap-1.5 mt-0.5">
            <UIcon name="i-lucide-phone" class="size-3.5 text-muted" />
            <p class="text-sm text-muted truncate">
              {{ client.phone }}
            </p>
          </div>
        </div>
      </div>
      <UButton
        icon="i-lucide-chevron-right"
        size="sm"
        variant="ghost"
        class="cursor-pointer"
      />
    </div>

    <!-- <p v-if="client.notes" class="mt-3 text-sm text-dimmed line-clamp-2">
      {{ client.notes }}
    </p> -->
  </UCard>
</template>
