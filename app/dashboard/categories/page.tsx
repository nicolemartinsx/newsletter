"use client";

import { Categories, Category, CategoryPayload } from "@/app/schema";
import { kyInstance } from "@/app/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Loader, Trash2 } from "lucide-react";
import { useToken } from "../utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function Page() {
  const [toEdit, setToEdit] = useState<Category | null | undefined>(undefined);
  const [toDelete, setToDelete] = useState<Category>();
  const form = useForm<CategoryPayload>({
    resolver: zodResolver(CategoryPayload),
    defaultValues: {
      nome: "",
    },
  });

  const token = useToken();
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!token.data) return undefined;
      return Categories.parse(
        await kyInstance
          .get(`categorias`, {
            headers: { Authorization: `Bearer ${token.data.token}` },
          })
          .json()
      );
    },
    enabled: !!token.data,
  });

  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: async (parameters: CategoryPayload) => {
      if (!token.data) return null;
      return kyInstance.post(`categorias`, {
        json: parameters,
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      toast.success("Categoria criada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error(`Erro ao criar categoria: ${error.message}`);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (parameters: Category) => {
      if (!token.data) return null;
      return kyInstance.put(`categorias/${parameters.id}`, {
        json: parameters,
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      toast.success("Categoria atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar categoria: ${error.message}`);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (parameters: Category) => {
      if (!token.data) return null;
      return kyInstance.delete(`categorias/${parameters.id}`, {
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      toast.success("Categoria excluída com sucesso");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error(`Erro ao excluir categoria: ${error.message}`);
    },
  });

  function onSubmit(values: CategoryPayload) {
    if (!toEdit) {
      createMutation.mutate(values);
    } else {
      updateMutation.mutate({ ...toEdit, ...values });
    }
    onEditDialogClose();
  }

  function onCreateClick() {
    setToEdit(null);
    form.reset({ nome: "" });
  }

  function onEditClick(category: Category) {
    setToEdit(category);
    form.reset(category);
  }

  function onDeleteClick(category: Category) {
    setToDelete(category);
  }

  function onDeleteConfirm() {
    if (toDelete) deleteMutation.mutate(toDelete);
    onDeleteDialogClose();
  }

  function onEditDialogClose() {
    setToEdit(undefined);
  }

  function onDeleteDialogClose() {
    setToDelete(undefined);
  }

  if (!categories.isSuccess) {
    return <Loader />;
  }
  return (
    <div className="flex flex-col w-full gap-4">
      <Dialog open={toEdit !== undefined} onOpenChange={onEditDialogClose}>
        <Button className="self-end" onClick={onCreateClick}>
          Criar
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Categoria</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
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
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  Salvar
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={toDelete !== undefined}
        onOpenChange={onDeleteDialogClose}
      >
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
              onClick={onDeleteConfirm}
            >
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">ID</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead className="w-40">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.data?.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.id}</TableCell>
              <TableCell>{c.nome}</TableCell>
              <TableCell className="flex gap-4">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => onEditClick(c)}
                >
                  <Edit />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDeleteClick(c)}
                >
                  <Trash2 />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
