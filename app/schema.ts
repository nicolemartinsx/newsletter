import { z } from "zod";

export const RemoteAddress = z.object({
  ip: z.string().ip({ version: "v4", message: "IP inválido" }),
  port: z.coerce
    .number()
    .min(20000, "Deve ser maior que 20000")
    .max(25000, "Deve ser menor que 25000"),
  prefix: z.string(),
});
export type RemoteAddress = z.infer<typeof RemoteAddress>;

export const User = z.object({
  nome: z
    .string()
    .min(1, "Deve conter ao menos 1 caracter")
    .max(100, "Deve conter no máximo 100 caracteres"),
  email: z
    .string()
    .min(1, "Deve conter ao menos 1 caracter")
    .max(100, "Deve conter no máximo 100 caracteres")
    .email("E-mail inválido"),
  senha: z
    .string()
    .min(3, "Deve conter ao menos 3 caracteres")
    .max(6, "Deve conter no máximo 6 caracteres")
    .regex(/[0-9]+/, "Deve conter apenas números"),
  admin: z.boolean(),
});
export type User = z.infer<typeof User>;

export const LoginSchema = User.omit({ nome: true, admin: true });
export type LoginSchema = z.infer<typeof LoginSchema>;

export const RegisterSchema = User.omit({ admin: true });
export type RegisterSchema = z.infer<typeof RegisterSchema>;

export const Token = z.object({
  token: z.string(),
});
export type Token = z.infer<typeof Token>;

export const TokenWithUser = User.partial({ nome: true })
  .omit({ senha: true })
  .merge(Token);
