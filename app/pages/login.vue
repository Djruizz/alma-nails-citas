<script setup lang="ts">
definePageMeta({ layout: false })

import { z } from "zod";

import type { AuthFormField, FormSubmitEvent } from "@nuxt/ui";

const fields: AuthFormField[] = [
  {
    name: "email",
    type: "email",
    label: "Correo electrónico",
    placeholder: "correo@ejemplo.com",
    required: true,
  },
  {
    name: "password",
    type: "password",
    label: "Contraseña",
    placeholder: "••••••••••••",
    required: true,
  },
  {
    name: "remember",
    type: "checkbox",
    label: "Recordarme",
  },
];

const schema = z.object({
  email: z
    .string({ message: "El correo es obligatorio" })
    .email("Ingresa un correo válido"),
  password: z
    .string({ message: "La contraseña es obligatoria" })
    .min(6, "Mínimo 6 caracteres"),
});

type Schema = z.output<typeof schema>;

const toast = useToast();

const supabase = useSupabaseClient();

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { error } = await supabase.auth.signInWithPassword({
    email: payload.data.email,
    password: payload.data.password,
  });
  if (error) {
    toast.add({
      title: "Error",
      description: "Error al iniciar sesión:",
      icon: "i-lucide-alert-circle",
      color: "error",
    });
    console.error(error.message);
    return;
  }
  toast.add({
    title: "Inicio de sesión",
    description: `Bienvenido, ${payload.data.email}`,
    icon: "i-lucide-circle-check",
    color: "success",
  });
  await navigateTo("/admin/citas");
}
</script>

<template>
  <div
    class="flex min-h-screen items-center justify-center bg-linear-to-br from-green-50 via-white to-emerald-100 px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
  >
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :fields="fields"
        title="Alma Nails"
        description="Inicia sesión en tu cuenta"
        icon="i-lucide-sparkles"
        :submit="{ label: 'Iniciar sesión' }"
        class="w-full"
        @submit="onSubmit"
      >
        <template #description>
          ¿No tienes cuenta?
          <ULink to="#" class="text-primary font-medium"> Regístrate </ULink>
        </template>

        <template #password-hint>
          <ULink to="#" class="text-primary font-medium" tabindex="-1">
            ¿Olvidaste tu contraseña?
          </ULink>
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
