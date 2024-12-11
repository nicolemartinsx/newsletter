"use client";

import { useQuery } from "@tanstack/react-query";
import { useToken } from "./utils";
import { Categories } from "../schema";
import { kyInstance } from "../utils";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Page() {
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

  if (!categories.isSuccess) {
    return <Loader />;
  }
  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Categorias</h1>
      <div className="flex gap-4">
        {categories.data?.map((c) => (
          <Button key={c.id} variant="outline">
            {c.nome}
          </Button>
        ))}
      </div>
    </div>
  );
}
