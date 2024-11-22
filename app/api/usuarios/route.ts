import mysql from "mysql2/promise";
import { getConnection } from "../utils";
import { RegisterSchema } from "@/app/schema";

const invalidDataError = Response.json(
  { mensagem: "Dados invalidos" },
  { status: 400 }
);

export async function POST(request: Request) {
  const conn = await getConnection();
  const result = RegisterSchema.safeParse(await request.json());
  if (!result.success) return invalidDataError;
  const { nome, email, senha } = result.data;

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
  return invalidDataError;
}
