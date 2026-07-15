// composables/useAppointmentStatus.ts
import type { Tables } from "~/types/database.types";

type AppointmentStatus = Tables<"appointments">["status"];
type BadgeColor =
  | "success"
  | "error"
  | "primary"
  | "secondary"
  | "info"
  | "warning"
  | "neutral";

export function useAppointmentStatus() {
  const getStatusColor = (status: AppointmentStatus): BadgeColor => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "info";
      case "COMPLETED":
        return "success";
      case "CANCELED":
        return "error";
      default:
        return "neutral";
    }
  };

  const getStatusLabel = (status: AppointmentStatus): string => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "CONFIRMED":
        return "Confirmada";
      case "COMPLETED":
        return "Completada";
      case "CANCELED":
        return "Cancelada";
      default:
        return status || "";
    }
  };

  const getStatusIcon = (status: AppointmentStatus): string => {
    switch (status) {
      case "PENDING":
        return "i-lucide-clock";
      case "CONFIRMED":
        return "i-lucide-check-circle";
      case "COMPLETED":
        return "i-lucide-check-check";
      case "CANCELED":
        return "i-lucide-x-circle";
      default:
        return "i-lucide-help-circle";
    }
  };

  const isValidStatusTransition = (
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus,
  ): boolean => {
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELED"],
      CONFIRMED: ["COMPLETED", "CANCELED"],
      COMPLETED: [],
      CANCELED: ["PENDING"],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  };

  const canCancel = (status: AppointmentStatus): boolean => {
    return status === "PENDING" || status === "CONFIRMED";
  };

  const canConfirm = (status: AppointmentStatus): boolean => {
    return status === "PENDING";
  };

  const canComplete = (status: AppointmentStatus, date: string): boolean => {
    return status === "CONFIRMED" && new Date(date) <= new Date();
  };

  const canRemind = (status: AppointmentStatus): boolean => {
    return status === "PENDING" || status === "CONFIRMED";
  };

  const canRestore = (status: AppointmentStatus): boolean => {
    return status === "CANCELED";
  };

  return {
    getStatusColor,
    getStatusLabel,
    getStatusIcon,
    isValidStatusTransition,
    canCancel,
    canConfirm,
    canComplete,
    canRemind,
    canRestore,
  };
}
