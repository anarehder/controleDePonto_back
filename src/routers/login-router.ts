import { loginController, logoutController } from "../controllers";
import { authenticateToken, validateBody } from "../middlewares";
import { loginSchema } from "../schemas";
import { Router } from "express";

const loginRouter = Router();

loginRouter.post("/", validateBody(loginSchema), loginController);
loginRouter.delete("/logout", authenticateToken, logoutController);

export {loginRouter};