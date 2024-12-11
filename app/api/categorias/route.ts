import mysql from "mysql2/promise";
import { getConnection, hasValidToken } from "../utils";
import { Category } from "@/app/schema";

const invalidDataError = Response.json(
  { mensagem: "Dados invalidos" },
  { status: 400 }
);

export async function POST(request: Request) {
  const token = await hasValidToken(request);
  if (!token) {
    return new Response(null, { status: 401 });
  }
  if (!token.admin) {
    return Response.json(
      {
        mensagem: "Você não tem permissão suficiente para performar esta ação",
      },
      { status: 403 }
    );
  }

  const conn = await getConnection();
  const result = Category.omit({ id: true }).safeParse(await request.json());
  if (!result.success) return invalidDataError;
  const { nome } = result.data;

  const [{ affectedRows }] = await conn.execute<mysql.ResultSetHeader>(
    `INSERT INTO categories (nome) VALUES (?)`,
    [nome]
  );
  if (affectedRows) {
    return new Response(null, { status: 201 });
  }
  return invalidDataError;
}

export async function GET(request: Request) {
  if (!(await hasValidToken(request))) {
    return new Response(null, { status: 401 });
  }

  const conn = await getConnection();

  const [categories] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM categories"
  );
  return Response.json(categories);
}
