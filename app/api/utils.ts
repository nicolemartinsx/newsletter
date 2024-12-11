import { jwtVerify } from "jose";
import mysql from "mysql2/promise";

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

let conn: mysql.Connection;
export async function getConnection() {
  if (!conn) {
    conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: "newsletter",
    });
  }
  return conn;
}

export async function hasValidToken(request: Request) {
  const authorization = request.headers.get("Authorization");
  if (authorization) {
    try {
      const verified = await jwtVerify(
        authorization.replace("Bearer ", ""),
        JWT_SECRET
      );
      return verified.payload;
    } catch {}
  }
  return null;
}
