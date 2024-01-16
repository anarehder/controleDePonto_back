import { LoginParams } from "../protocols";
import Joi from "joi";

export const loginSchema = Joi.object<LoginParams>({
    username: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
})