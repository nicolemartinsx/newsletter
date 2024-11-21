import mysql from "mysql2/promise";

mysql
  .createConnection({
    user: "root",
    password: "",
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
            senha VARCHAR(60) NOT NULL,
            admin BOOLEAN NOT NULL DEFAULT FALSE
        );
    
        INSERT INTO users VALUES ('Admin', 'admin@email.com', '123456', TRUE);
    `);
    await conn.end();
  });
