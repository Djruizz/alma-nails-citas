import * as z from "zod";

export const clientSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  phone: z.string().optional().default(""),
  client_since: z.string().optional(),
  notes: z.string().optional().default(""),
});

export type ClientSchema = z.output<typeof clientSchema>;
