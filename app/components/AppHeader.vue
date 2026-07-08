<script setup lang="ts">
import logo from "~/assets/AlmaPadillaLogo.jpg";

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
        label: "Configuración",
        icon: "i-lucide-settings",
        to: "/admin/configuracion",
      },
    ],
    [
      {
        label: "Cerrar sesión",
        icon: "i-lucide-log-out",
        color: "error" as const,
        onSelect: async () => {
          await supabase.auth.signOut();
          await navigateTo("/login", { external: true });
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
  <UHeader :ui="{ container: 'max-w-5xl' }" :toggle="false" class="sticky-top">
    <template #left>
      <img :src="logo" alt="Logo Alma" class="h-16 rounded" />
    </template>
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
