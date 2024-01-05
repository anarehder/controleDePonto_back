import { loginController } from "@/controllers";
import { Router } from "express";

const loginRouter = Router();

loginRouter.post("/", loginController);

export {loginRouter};