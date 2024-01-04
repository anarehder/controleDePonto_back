import { Router } from "express";

const bankRouter = Router();

bankRouter.post("/", (_req, res) => res.send("POST!"));
bankRouter.get("/", (_req, res) => res.send("GET!"));
bankRouter.put("/", (_req, res) => res.send("PUT!"));
bankRouter.delete("/", (_req, res) => res.send("DELETE!"));

export { bankRouter };
