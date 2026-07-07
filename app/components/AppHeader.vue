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
  <header
    class="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl z-40 flex items-center justify-between h-16 px-4 sm:px-6 border-b border-default/60 bg-elevated/75 backdrop-blur-md supports-backdrop-filter:bg-elevated/60"
  >
    <div class="flex items-center gap-2.5">
      <div
        class="flex items-center justify-center size-9 rounded-xl bg-linear-to-br from-primary-400 to-primary-600 shadow-sm shadow-primary/30"
      >
        <UIcon name="i-lucide-sparkles" class="size-5 text-inverted" />
      </div>
      <span class="text-lg font-semibold tracking-tight text-highlighted">
        Alma Nails
      </span>
    </div>

    <div class="flex items-center gap-2">
      <UDropdownMenu v-if="user" :items="items" :content="{ align: 'end' }">
        <button
          class="flex items-center justify-center size-9 rounded-full text-sm font-semibold text-muted ring-1 ring-default hover:bg-accented transition-colors cursor-pointer"
        >
          {{ initials }}
        </button>
      </UDropdownMenu>
    </div>
  </header>
</template>
