import { z } from "zod";

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, { error: "El nombre de usuario debe ser mínimo de 3 caracteres" })
      .max(20, {
        error: "El nombre de usuario debe ser máximo de 20 caracteres.",
      }),
    email: z.email({ error: "El correo debe tener un formato valido." }),
    password: z
      .string()
      .min(8, { error: "La contraseña debe tener como mínimo 8 caracteres." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });
