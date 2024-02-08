import { getGeneralReportController, getMonthHoursController, getTodayHoursController, getUserReportController, postBankHourController } from "../controllers";
import { authenticateToken, validateBody } from "../middlewares";
import { addRegistrySchema } from "../schemas";
import { getUserReportSchema } from "../schemas/user-report-schema";
import { Router } from "express";

const bankRouter = Router();

bankRouter.post("/", authenticateToken, validateBody(addRegistrySchema), postBankHourController);
bankRouter.get("/month/:month", authenticateToken, getMonthHoursController);
bankRouter.get("/today/:day", authenticateToken, getTodayHoursController);
bankRouter.post("/userReport", authenticateToken, validateBody(getUserReportSchema), getUserReportController);
bankRouter.post("/generalReport", authenticateToken, validateBody(getUserReportSchema), getGeneralReportController);
bankRouter.put("/", (_req, res) => res.send("PUT!"));
bankRouter.delete("/", (_req, res) => res.send("DELETE!"));

export { bankRouter };
