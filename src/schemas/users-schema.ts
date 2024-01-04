import { newUser } from "@/protocols";
import Joi from "joi";

export const createUserSchema = Joi.object<newUser>({
    name: Joi.string().min(3).required(),
    username: Joi.string().min(6).required(),
    password: Joi.string().min(6).required(),
})