import * as z from "zod";

export const appointmentSchema = z.object({
  client_id: z.string().min(1, "El cliente es obligatorio"),
  service_id: z.string().optional(),
  date: z.string().min(1, "La fecha es obligatoria"),
  duration_minutes: z
    .number({ message: "La duración es obligatoria" })
    .min(1, "La duración debe ser al menos 1 minuto"),
  price: z
    .number({ message: "El precio es obligatorio" })
    .min(0, "El precio no puede ser negativo")
    .optional(),
  notes: z.string().optional().default(""),
});

export type AppointmentSchema = z.output<typeof appointmentSchema>;
