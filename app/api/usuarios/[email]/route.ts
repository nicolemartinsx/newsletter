import mysql from "mysql2/promise";
import { getConnection, hasValidToken } from "../../utils";
import { RegisterSchema } from "@/app/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  if (!(await hasValidToken(request))) {
    return new Response(null, { status: 401 });
  }

  const email = (await params).email;
  const conn = await getConnection();

  const [[user]] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT nome, email, senha FROM users WHERE email = ?",
    [email]
  );
  if (!user)
    return Response.json(
      { mensagem: "Usuário não encontrado" },
      { status: 404 }
    );
  return Response.json(user);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  if (!(await hasValidToken(request))) {
    return new Response(null, { status: 401 });
  }

  const email = (await params).email;
  const conn = await getConnection();

  const [[user]] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  if (!user)
    return Response.json(
      { mensagem: "Usuário não encontrado" },
      { status: 404 }
    );

  const result = RegisterSchema.omit({ email: true }).safeParse(
    await request.json()
  );
  if (!result.success)
    return Response.json({ mensagem: "Dados invalidos" }, { status: 400 });
  const payload = result.data;
  const [{ affectedRows }] = await conn.execute<mysql.ResultSetHeader>(
    `UPDATE users SET nome = ?, senha = ? WHERE email = ?`,
    [payload.nome, payload.senha, email]
  );
  if (affectedRows) {
    return new Response(null, { status: 200 });
  }
  return Response.json({ mensagem: "Dados invalidos" }, { status: 400 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  if (!(await hasValidToken(request))) {
    return new Response(null, { status: 401 });
  }

  const email = (await params).email;
  const conn = await getConnection();

  const [[user]] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  if (!user)
    return Response.json(
      { mensagem: "Usuário não encontrado" },
      { status: 404 }
    );

  if (user.admin)
    return Response.json({ mensagem: "Dados invalidos" }, { status: 400 });

  const [{ affectedRows }] = await conn.execute<mysql.ResultSetHeader>(
    `DELETE FROM users WHERE email = ?`,
    [email]
  );
  if (affectedRows) {
    return new Response(null, { status: 200 });
  }
  return Response.json({ mensagem: "Dados invalidos" }, { status: 400 });
}
