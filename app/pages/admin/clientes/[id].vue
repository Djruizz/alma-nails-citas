<script setup lang="ts">
import type { Tables } from "~/types/database.types";

definePageMeta({ layout: "default" });

const route = useRoute();
const router = useRouter();
const toast = useToast();

const { getClientDetail } = useClients();
const {
  clientAppointments,
  clientAppointmentsStatus,
  fetchClientAppointments,
  refreshClientAppointments,
  restoreAppointment,
  markReagendada,
} = useAppointments();

type Client = Tables<"clients">;
type AppointmentWithRelations = Tables<"appointments"> & {
  clients?: Tables<"clients"> | null;
  services?: Tables<"services"> | null;
};

const clientId = computed(() => (route.params.id as string) || "");

const client = ref<Client | null>(null);
const loadingClient = ref(true);
const notFound = ref(false);
const refreshing = ref(false);

async function loadClient() {
  loadingClient.value = true;
  notFound.value = false;
  try {
    const data = await getClientDetail(clientId.value);
    if (!data) {
      notFound.value = true;
      client.value = null;
      return;
    }
    client.value = data;
  } catch (err: any) {
    toast.add({
      title: "Error al cargar el cliente",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
    notFound.value = true;
  } finally {
    loadingClient.value = false;
  }
}

async function loadAppointments() {
  if (!clientId.value) return;
  try {
    await fetchClientAppointments(clientId.value);
  } catch (err: any) {
    toast.add({
      title: "Error al cargar las citas",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

function goBack() {
  router.push("/admin/clientes");
}

// Modales (reutilizan los ya existentes)
const appointmentModal = reactive({
  open: false,
  mode: "create" as "create" | "edit",
  appointment: null as AppointmentWithRelations | null,
});
const detailModal = reactive({
  open: false,
  appointment: null as AppointmentWithRelations | null,
});
const deleteModal = reactive({
  open: false,
  appointment: null as AppointmentWithRelations | null,
});
const clientModal = reactive({
  open: false,
  mode: "edit" as "create" | "edit",
});
const clientDeleteModal = reactive({
  open: false,
});

function openEditAppointment(a: AppointmentWithRelations) {
  appointmentModal.mode = "edit";
  appointmentModal.appointment = a;
  appointmentModal.open = true;
}

function openDetailAppointment(a: AppointmentWithRelations) {
  detailModal.appointment = a;
  detailModal.open = true;
}

function openDeleteAppointment(a: AppointmentWithRelations) {
  deleteModal.appointment = a;
  deleteModal.open = true;
}

function openEditClient() {
  clientModal.mode = "edit";
  clientModal.open = true;
}

function openDeleteClient() {
  clientDeleteModal.open = true;
}

async function onRestore(a: AppointmentWithRelations) {
  try {
    await restoreAppointment(a.id);
    toast.add({
      title: "Cita recuperada",
      description: "La cita ha sido restaurada como pendiente",
      color: "success",
      icon: "i-lucide-rotate-ccw",
    });
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

async function onReagendar(a: AppointmentWithRelations) {
  try {
    await markReagendada(a.id);
    toast.add({
      title: "Cita reagendada",
      description: "Se marcó el seguimiento como completado",
      color: "success",
      icon: "i-lucide-calendar-check",
    });
  } catch (err: any) {
    toast.add({
      title: "Error",
      description: err?.message || "Ocurrió un error inesperado",
      color: "error",
      icon: "i-lucide-alert-circle",
    });
  }
}

async function onRefreshAll() {
  refreshing.value = true;
  try {
    await Promise.all([
      loadClient(),
      refreshClientAppointments(clientId.value),
    ]);
  } finally {
    refreshing.value = false;
  }
}

// Actualiza el estado local del cliente sin refetchear desde el servidor.
// El sync de las citas anidadas lo hace ClientModal vía syncClientInAppointments.
function onClientSaved(updated: Client) {
  if (client.value && client.value.id === updated.id) {
    client.value = updated;
  }
}

function onClientDeleted(id: string) {
  if (client.value && client.value.id === id) {
    client.value = { ...client.value, is_active: false };
  }
}

// Al montar y si cambia el id (navegación entre clientes) recarga todo
watch(
  () => clientId.value,
  () => {
    loadClient();
    loadAppointments();
  },
  { immediate: true },
);
</script>

<template>
  <div class="p-4 sm:p-6 space-y-6">
    <ClientDetailHeader
      title="Detalle del cliente"
      description="Historial y datos del cliente"
      :loading="loadingClient"
      @back="goBack"
    >
      <template v-if="client" #actions>
        <UButton
          icon="i-lucide-refresh-cw"
          variant="ghost"
          color="neutral"
          size="md"
          :ui="{
            leadingIcon:
              refreshing || clientAppointmentsStatus === 'pending'
                ? 'animate-spin duration-200'
                : '',
          }"
          @click="onRefreshAll"
        />
        <UButton
          icon="i-lucide-pencil"
          label="Editar"
          size="md"
          variant="soft"
          color="neutral"
          @click="openEditClient"
        />
      </template>
    </ClientDetailHeader>

    <ClientNotFound v-if="!loadingClient && notFound" @back="goBack" />

    <template v-else>
      <ClientInfoCard
        :client="client"
        :loading="loadingClient"
        @delete="openDeleteClient"
      />

      <ClientStatsGrid :appointments="clientAppointments" />

      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-semibold text-highlighted">
            Historial de citas
          </h2>
          <p class="text-xs text-muted">
            {{ clientAppointments.length }} cita(s)
          </p>
        </div>

        <AppointmentList
          :appointments="clientAppointments"
          :loading="
            clientAppointmentsStatus === 'pending' &&
            clientAppointments.length === 0
          "
          @edit="openEditAppointment"
          @detail="openDetailAppointment"
          @delete="openDeleteAppointment"
          @restore="onRestore"
          @reagendar="onReagendar"
        />
      </div>
    </template>

    <!-- Modales -->
    <ClientModal
      v-model:open="clientModal.open"
      mode="edit"
      :client="client ?? undefined"
      @saved="onClientSaved"
    />

    <ClientDeleteModal
      v-model:open="clientDeleteModal.open"
      :client="client ?? undefined"
      @deleted="onClientDeleted"
    />

    <AppointmentModal
      v-model:open="appointmentModal.open"
      :mode="appointmentModal.mode"
      :appointment="appointmentModal.appointment ?? undefined"
    />

    <AppointmentDetailModal
      v-model:open="detailModal.open"
      :appointment="detailModal.appointment ?? undefined"
    />

    <AppointmentDeleteModal
      v-model:open="deleteModal.open"
      :appointment="deleteModal.appointment ?? undefined"
    />
  </div>
</template>
