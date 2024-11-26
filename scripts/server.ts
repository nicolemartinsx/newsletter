import { createServer } from "http";
import { parse } from "url";
import next from "next";
import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });
rl.question("Qual porta? ", (newPort) => {
  const port = parseInt(newPort || "22222", 10);
  const dev = process.env.NODE_ENV !== "production";
  const app = next({ dev });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url!, true);
      if (req.url?.includes("api")) {
        console.log(req.method, req.url);
      }
      handle(req, res, parsedUrl);
    }).listen(port);

    console.log(
      `> Server listening at http://localhost:${port} as ${
        dev ? "development" : process.env.NODE_ENV
      }`
    );
  });
});
