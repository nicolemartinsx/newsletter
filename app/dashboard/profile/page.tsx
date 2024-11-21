"use client";

import { RegisterSchema } from "@/app/schema";
import { kyInstance } from "@/app/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useToken } from "../utils";

export default function Page() {
  const router = useRouter();
  const token = useToken();
  const updateMutation = useMutation({
    mutationFn: async (parameters: RegisterSchema) => {
      if (!token.data) return null;
      return kyInstance.put(`/api/usuarios/${token.data.email}`, {
        json: parameters,
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      toast.success("Dados atualizados com sucesso");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar dados: ${error.message}`);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!token.data) return null;
      return kyInstance.delete(`/api/usuarios/${token.data.email}`, {
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      toast.success("Conta excluída com sucesso");
      localStorage.removeItem("token");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(`Erro ao excluir conta: ${error.message}`);
    },
  });

  function onSubmit(values: RegisterSchema) {
    updateMutation.mutate(values);
  }

  const user = useQuery({
    queryKey: ["user", token.data?.email],
    queryFn: async () => {
      if (!token.data) return undefined;
      return RegisterSchema.parse(
        await kyInstance
          .get(`/api/usuarios/${token.data.email}`, {
            headers: { Authorization: `Bearer ${token.data.token}` },
          })
          .json()
      );
    },
    enabled: !!token.data,
  });
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
    },
    values: user.data,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  useEffect(() => {
    if (user.error)
      toast.error(`Erro ao recuperar dados da conta: ${user.error.message}`);
  }, [user.error]);

  return (
    <div className="flex w-full items-center justify-center px-4">
      {token.isFetching || user.isFetching ? (
        <Loader />
      ) : (
        <Card className="mx-auto max-w-sm w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Perfil</CardTitle>
            <CardDescription>Atualize seu nome e senha</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                className="grid gap-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                          disabled
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
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updateMutation.isPending}
                  >
                    Atualizar
                  </Button>
                  {token.data && !token.data.admin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate()}
                          >
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
