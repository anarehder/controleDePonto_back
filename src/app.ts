import "express-async-errors";
import express, { Express } from "express";
import cors from "cors";

import { loadEnv, connectDb, disconnectDB } from "@/config";
import { handleApplicationErrors } from "@/middlewares";
import { bankRouter, loginRouter, usersRouter } from "@/routers";

loadEnv();

const app = express();
app
  .use(cors({
    origin: 'http://127.0.0.1:5173', // ou o endereço do seu frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Permite o envio de cookies de autenticação
  }))
  .use(express.json())
  .get("/health", (_req, res) => res.send("OK!"))
  .use("/users", usersRouter)
  .use("/bank", bankRouter)
  .use("/login", loginRouter)
  .use(handleApplicationErrors);

export function init(): Promise<Express> {
  connectDb();
  return Promise.resolve(app);
}

export async function close(): Promise<void> {
  await disconnectDB();
}

export default app;
