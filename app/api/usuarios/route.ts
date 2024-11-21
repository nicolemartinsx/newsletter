import mysql from "mysql2/promise";
import { getConnection } from "../utils";
import { RegisterSchema } from "@/app/schema";

export async function POST(request: Request) {
  const conn = await getConnection();
  const { nome, email, senha } = RegisterSchema.parse(await request.json());

  const [[user]] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  if (user) {
    return Response.json({ mensagem: "Email ja cadastrado" }, { status: 409 });
  }

  const [{ affectedRows }] = await conn.execute<mysql.ResultSetHeader>(
    `INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)`,
    [nome, email, senha]
  );
  if (affectedRows) {
    return new Response(null, { status: 201 });
  }
  return Response.json({ mensagem: "Dados invalidos" }, { status: 400 });
}
