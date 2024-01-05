import { createUserController, getUsersController } from "@/controllers";
import { validateBody } from "@/middlewares";
import { createUserSchema } from "@/schemas";
import { Router } from "express";

const usersRouter = Router();

usersRouter.post("/", validateBody(createUserSchema), createUserController);
usersRouter.get("/", getUsersController);
usersRouter.put("/", (_req, res) => res.send("PUT!"));
usersRouter.delete("/", (_req, res) => res.send("DELETE!"));

export { usersRouter };
