export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith("/admin")) {
    return;
  }

  const user = useSupabaseUser();

  if (!user.value) {
    const supabase = useSupabaseClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      return navigateTo("/login");
    }
  }
});
