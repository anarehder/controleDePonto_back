import { getMonthHoursController, getTodayHoursController, postBankHourController } from "@/controllers";
import { authenticateToken, validateBody } from "@/middlewares";
import { addRegistrySchema } from "@/schemas";
import { Router } from "express";

const bankRouter = Router();

bankRouter.post("/", authenticateToken, validateBody(addRegistrySchema), postBankHourController);
bankRouter.get("/month/:month", authenticateToken, getMonthHoursController);
bankRouter.get("/today/:day", authenticateToken, getTodayHoursController);
bankRouter.put("/", (_req, res) => res.send("PUT!"));
bankRouter.delete("/", (_req, res) => res.send("DELETE!"));

export { bankRouter };
