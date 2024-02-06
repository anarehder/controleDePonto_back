import { changePasswordController, createUserController, getUsersController } from "../controllers";
import { authenticateToken, validateBody } from "../middlewares";
import { createUserSchema, loginSchema } from "../schemas";
import { Router } from "express";

const usersRouter = Router();

usersRouter.post("/", authenticateToken, validateBody(createUserSchema), createUserController);
usersRouter.get("/", authenticateToken, getUsersController);
usersRouter.post("/changepassword", authenticateToken, validateBody(loginSchema), changePasswordController);
usersRouter.put("/", (_req, res) => res.send("PUT!"));
usersRouter.delete("/", (_req, res) => res.send("DELETE!"));

export { usersRouter };
