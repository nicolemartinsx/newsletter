import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro</CardTitle>
          <CardDescription>
            Digite seu nome, email e senha para criar a sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                name="nome"
                minLength={3}
                maxLength={100}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="email@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Input
                id="password"
                type="password"
                name="senha"
                minLength={3}
                maxLength={6}
                pattern="[0-9]+"
                title="Apenas números"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Cadastrar
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Já possúi uma conta?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
