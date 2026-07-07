<script setup lang="ts">
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const items = computed(() => {
  if (!user.value) return [];
  return [
    [
      {
        label: user.value.email ?? "Perfil",
        avatar: { src: user.value.user_metadata?.avatar_url },
        disabled: true,
      },
    ],
    [
      {
        label: "Cerrar sesión",
        icon: "i-lucide-log-out",
        color: "error" as const,
        onSelect: async () => {
          await supabase.auth.signOut();
          await navigateTo("/login");
        },
      },
    ],
  ];
});

const initials = computed(() => {
  const email = user.value?.email ?? "?";
  return email[0]?.toUpperCase() ?? "?";
});
</script>

<template>
  <UHeader
    title="AlmaNails"
    :ui="{ container: 'max-w-5xl' }"
    :toggle="false"
    class="sticky-top"
  >
    <template #right>
      <UDropdownMenu v-if="user" :items="items">
        <UButton
          class="flex items-center justify-center size-9 rounded-full text-sm font-semibold text-muted ring-1 ring-default hover:bg-accented transition-colors cursor-pointer"
        >
          {{ initials }}
        </UButton>
      </UDropdownMenu>
    </template>
  </UHeader>
</template>
