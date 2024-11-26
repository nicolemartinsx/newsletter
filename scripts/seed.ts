import mysql from "mysql2/promise";
import "dotenv/config";

mysql
  .createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    multipleStatements: true,
  })
  .then(async (conn) => {
    await conn.query(`
        DROP DATABASE IF EXISTS newsletter;
        CREATE DATABASE newsletter;
        USE newsletter;
    
        CREATE TABLE users (
            nome VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL PRIMARY KEY,
            senha VARCHAR(6) NOT NULL,
            admin BOOLEAN NOT NULL DEFAULT FALSE
        );
    
        INSERT INTO users VALUES ('Admin', 'admin@email.com', '123456', TRUE);
    `);
    await conn.end();
  });
