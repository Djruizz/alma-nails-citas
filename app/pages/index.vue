<script setup lang="ts">
definePageMeta({ layout: false })

const supabase = useSupabaseClient()
const { data } = await supabase.auth.getSession()

if (data.session) {
  await navigateTo('/admin/citas')
} else {
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-background">
    <UIcon name="i-lucide-loader-circle" class="size-8 text-primary animate-spin" />
  </div>
</template>
