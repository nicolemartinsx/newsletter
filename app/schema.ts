import { z } from "zod";

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

export const TokenWithUser = User.omit({ senha: true }).merge(Token);
