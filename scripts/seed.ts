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

        CREATE TABLE categories (
          id INTEGER(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
          nome VARCHAR(150) NOT NULL
        );

        CREATE TABLE news (
          id INTEGER(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
          idCategoria INTEGER(11) NOT NULL,
          descricao VARCHAR(500) NOT NULL,
          FOREIGN KEY (idCategoria) REFERENCES categories(id)
          ON DELETE CASCADE
        );
    
        INSERT INTO users VALUES ('Admin', 'admin@email.com', '123456', TRUE);
        INSERT INTO categories VALUES (1, 'Acidentes');
        INSERT INTO news VALUES (1, 1, 'Aconteceu um acidente na BR 153');
    `);
    await conn.end();
  });
