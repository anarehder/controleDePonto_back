import { Router } from "express";

const usersRouter = Router();

usersRouter.post("/", (_req, res) => res.send("POST!"));
usersRouter.get("/", (_req, res) => res.send("GET!"));
usersRouter.put("/", (_req, res) => res.send("PUT!"));
usersRouter.delete("/", (_req, res) => res.send("DELETE!"));

export { usersRouter };
