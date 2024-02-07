import { sessionController } from "../controllers";
import { validateBody } from "../middlewares";
import { sessionSchema } from "../schemas";
import { Router } from "express";

const sessionRouter = Router();

sessionRouter.post("/", validateBody(sessionSchema), sessionController);

export {sessionRouter};