"use client";

import { useQuery } from "@tanstack/react-query";
import { useToken } from "./utils";
import { Categories, NewsArray } from "../schema";
import { kyInstance } from "../utils";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [selectedCategory, setSelectedCategory] = useState<number>();
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
  const news = useQuery({
    queryKey: ["news", selectedCategory],
    queryFn: async () => {
      if (!token.data) return undefined;
      return NewsArray.parse(
        await kyInstance
          .get(`avisos/${selectedCategory}`, {
            headers: { Authorization: `Bearer ${token.data.token}` },
          })
          .json()
      );
    },
    enabled: !!token.data && !!selectedCategory,
  });

  if (!categories.isSuccess) {
    return <Loader />;
  }
  return (
    <div className="w-full flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Categorias</h1>
      <div className="flex gap-4">
        {categories.data?.map((c) => (
          <Button
            key={c.id}
            variant="outline"
            onClick={() => setSelectedCategory(c.id)}
            className={selectedCategory === c.id ? "bg-slate-200" : ""}
          >
            {c.nome}
          </Button>
        ))}
      </div>
      {news.data?.map((n) => (
        <p key={n.id}>{n.descricao}</p>
      ))}
    </div>
  );
}
