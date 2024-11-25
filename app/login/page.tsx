"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { LoginSchema, Token } from "@/app/schema";
import { kyInstance } from "../utils";

export default function Page() {
  const router = useRouter();
  const form = useForm<LoginSchema>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", senha: "" },
  });
  const mutation = useMutation({
    mutationFn: async (parameters: LoginSchema) =>
      Token.parse(await kyInstance.post("login", { json: parameters }).json()),
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      router.replace("/dashboard");
    },
    onError: (error) => {
      form.setError("senha", { message: error.message });
    },
  });

  function onSubmit(values: LoginSchema) {
    mutation.mutate(values);
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Digite seu email e senha para acessar a sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between items-center">
                      Senha
                    </FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                Login
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Não possui uma conta?{" "}
            <Link href="/register" className="underline">
              Criar conta
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
