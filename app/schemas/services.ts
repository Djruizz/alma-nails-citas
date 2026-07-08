import * as z from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional().default(""),
  duration_minutes: z
    .number({ message: "La duración es obligatoria" })
    .min(1, "La duración debe ser de al menos 1 minuto"),
  price: z
    .number({ message: "El precio es obligatorio" })
    .min(0, "El precio no puede ser negativo"),
});

export type ServiceSchema = z.output<typeof serviceSchema>;
