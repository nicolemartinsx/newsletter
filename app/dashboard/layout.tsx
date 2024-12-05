"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToken } from "./utils";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { kyInstance } from "../utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useToken();
  if (token.isSuccess && !token.data) {
    toast.error("Você precisa fazer login para acessar o dashboard");
    router.replace("/login");
  }

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!token.data) return null;
      return kyInstance.post(`logout`, {
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      localStorage.removeItem("token");
      queryClient.removeQueries({ queryKey: ["token"] });
      router.push("/login");
    },
    onError: (error) => {
      toast.error(`Erro ao fazer logout: ${error.message}`);
    },
  });

  function onLogout() {
    logoutMutation.mutate();
  }

  function onProfile() {
    router.push("/dashboard/profile");
  }

  return (
    <div className="flex-col flex">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="ml-auto flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                >
                  <Menu />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-32" align="end" forceMount>
                <DropdownMenuItem onSelect={onProfile}>Perfil</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onLogout}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-8 pt-6">{children}</div>
    </div>
  );
}
