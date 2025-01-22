"use client";

import { Categories, News, NewsArray, NewsPayload } from "@/app/schema";
import { kyInstance } from "@/app/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Page() {
  const [toEdit, setToEdit] = useState<News | null | undefined>(undefined);
  const [toDelete, setToDelete] = useState<News>();
  const form = useForm<NewsPayload>({
    resolver: zodResolver(NewsPayload),
    defaultValues: {
      descricao: "",
    },
  });

  const token = useToken();
  const news = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      if (!token.data) return undefined;
      return NewsArray.parse(
        await kyInstance
          .get(`avisos`, {
            headers: { Authorization: `Bearer ${token.data.token}` },
          })
          .json()
      );
    },
    enabled: !!token.data,
  });
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
    mutationFn: async (parameters: NewsPayload) => {
      if (!token.data) return null;
      return kyInstance.post(`avisos`, {
        json: parameters,
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      toast.success("Aviso criado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (error) => {
      toast.error(`Erro ao criar aviso: ${error.message}`);
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (parameters: News) => {
      if (!token.data) return null;
      return kyInstance.put(`avisos/${parameters.id}`, {
        json: parameters,
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      toast.success("Aviso atualizado com sucesso");
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar aviso: ${error.message}`);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: async (parameters: News) => {
      if (!token.data) return null;
      return kyInstance.delete(`avisos/${parameters.id}`, {
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      toast.success("Aviso excluído com sucesso");
      queryClient.invalidateQueries({ queryKey: ["news"] });
    },
    onError: (error) => {
      toast.error(`Erro ao excluir aviso: ${error.message}`);
    },
  });

  function onSubmit(values: NewsPayload) {
    if (!toEdit) {
      createMutation.mutate(values);
    } else {
      updateMutation.mutate({ ...toEdit, ...values });
    }
    onEditDialogClose();
  }

  function onCreateClick() {
    setToEdit(null);
    form.reset({ descricao: "" });
  }

  function onEditClick(news: News) {
    setToEdit(news);
    form.reset(news);
  }

  function onDeleteClick(news: News) {
    setToDelete(news);
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

  if (!news.isSuccess) {
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
                name="idCategoria"
                disabled={!!toEdit}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select
                      disabled={!!toEdit}
                      onValueChange={field.onChange}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.data?.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
          {news.data?.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.id}</TableCell>
              <TableCell>{c.descricao}</TableCell>
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
