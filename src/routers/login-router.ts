import { loginController } from "@/controllers";
import { validateBody } from "@/middlewares";
import { loginSchema } from "@/schemas";
import { Router } from "express";

const loginRouter = Router();

loginRouter.post("/", validateBody(loginSchema), loginController);

export {loginRouter};