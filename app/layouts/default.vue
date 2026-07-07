<script setup lang="ts">
const user = useSupabaseUser();
</script>

<template>
  <div class="min-h-dvh bg-default">
    <AppHeader v-if="user" />

    <main class="max-w-5xl mx-auto" :class="{ 'pb-18': user }">
      <NuxtPage />
    </main>

    <AppBottomNav v-if="user" />
  </div>
</template>
