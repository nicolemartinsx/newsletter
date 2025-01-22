import mysql from "mysql2/promise";
import { getConnection, hasValidToken } from "../../utils";
import { NewsPayload } from "@/app/schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: number }> }
) {
  if (!(await hasValidToken(request))) {
    return new Response(null, { status: 401 });
  }

  const id = (await params).id;
  const conn = await getConnection();

  const [news] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM news WHERE idCategoria = ?",
    [id]
  );
  return Response.json(news);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: number }> }
) {
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

  const id = (await params).id;
  const conn = await getConnection();

  const [[news]] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM news WHERE id = ?",
    [id]
  );
  if (!news)
    return Response.json({ mensagem: "Aviso não encontrado" }, { status: 404 });

  const result = NewsPayload.safeParse(await request.json());
  if (!result.success)
    return Response.json({ mensagem: "Dados invalidos" }, { status: 400 });
  const payload = result.data;
  const [{ affectedRows }] = await conn.execute<mysql.ResultSetHeader>(
    `UPDATE news SET descricao = ? WHERE id = ?`,
    [payload.descricao, id]
  );
  if (affectedRows) {
    return new Response(null, { status: 200 });
  }
  return Response.json({ mensagem: "Dados invalidos" }, { status: 400 });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: number }> }
) {
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

  const id = (await params).id;
  const conn = await getConnection();

  const [[category]] = await conn.execute<mysql.RowDataPacket[]>(
    "SELECT * FROM news WHERE id = ?",
    [id]
  );
  if (!category)
    return Response.json({ mensagem: "Aviso não encontrado" }, { status: 404 });

  const [{ affectedRows }] = await conn.execute<mysql.ResultSetHeader>(
    `DELETE FROM news WHERE id = ?`,
    [id]
  );
  if (affectedRows) {
    return new Response(null, { status: 200 });
  }
  return Response.json({ mensagem: "Dados invalidos" }, { status: 400 });
}
