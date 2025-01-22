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
import { usePathname, useRouter } from "next/navigation";
import { useToken } from "./utils";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { kyInstance } from "../utils";
import { useEffect } from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useToken();

  useEffect(() => {
    if (token.isSuccess && !token.data) {
      toast.error("Você precisa fazer login para acessar o dashboard");
      router.replace("/login");
    }
  }, [router, token]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!token.data) return null;
      return kyInstance.post(`logout`, {
        headers: { Authorization: `Bearer ${token.data.token}` },
      });
    },
    onSuccess: () => {
      localStorage.removeItem("token");
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
    <div className="flex-col flex items-center">
      <div className="border-b w-full flex justify-center">
        <div className="max-w-screen-md w-full flex h-16 items-center px-4">
          <nav className="ml-4 flex gap-8">
            <Link
              href="/dashboard"
              className={`text-sm ${
                pathname === "/dashboard"
                  ? "underline font-bold"
                  : "font-medium"
              }`}
            >
              Painel
            </Link>
            {token.data?.admin && (
              <>
                <Link
                  href="/dashboard/categories"
                  className={`text-sm ${
                    pathname === "/dashboard/categories"
                      ? "underline font-bold"
                      : "font-medium"
                  }`}
                >
                  Categorias
                </Link>
                <Link
                  href="/dashboard/news"
                  className={`text-sm ${
                    pathname === "/dashboard/news"
                      ? "underline font-bold"
                      : "font-medium"
                  }`}
                >
                  Avisos
                </Link>
              </>
            )}
          </nav>
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
      <div className="flex-1 flex justify-center space-y-4 p-8 pt-6 max-w-screen-md w-full">
        {children}
      </div>
    </div>
  );
}
