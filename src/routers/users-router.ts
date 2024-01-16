import { createUserController, getUsersController } from "../controllers";
import { authenticateToken, validateBody } from "../middlewares";
import { createUserSchema } from "../schemas";
import { Router } from "express";

const usersRouter = Router();

usersRouter.post("/", authenticateToken, validateBody(createUserSchema), createUserController);
usersRouter.get("/", authenticateToken, getUsersController);
usersRouter.put("/", (_req, res) => res.send("PUT!"));
usersRouter.delete("/", (_req, res) => res.send("DELETE!"));

export { usersRouter };
