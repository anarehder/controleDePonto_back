import { getMonthHoursController, getTodayHoursController } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const bankRouter = Router();

bankRouter.post("/", (_req, res) => res.send("POST!"));
bankRouter.get("/:month", authenticateToken, getMonthHoursController);
bankRouter.get("/", authenticateToken, getTodayHoursController);
bankRouter.put("/", (_req, res) => res.send("PUT!"));
bankRouter.delete("/", (_req, res) => res.send("DELETE!"));

export { bankRouter };
