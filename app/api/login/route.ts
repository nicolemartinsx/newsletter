import { LoginSchema } from "@/app/schema";
import { SignJWT } from "jose";
import mysql from "mysql2/promise";
import { getConnection, JWT_SECRET } from "../utils";

export async function POST(request: Request) {
  const conn = await getConnection();
  const { email, senha } = LoginSchema.parse(await request.json());
  const [[user]] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  if (user && user.senha === senha) {
    const token = await new SignJWT({
      nome: user.nome,
      email: user.email,
      admin: user.admin === 1,
    })
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
      })
      .setIssuedAt()
      .setExpirationTime("15 mins")
      .sign(JWT_SECRET);
    return Response.json({ token });
  }
  return Response.json(
    { mensagem: "Email e/ou senha invalidos" },
    { status: 401 }
  );
}
