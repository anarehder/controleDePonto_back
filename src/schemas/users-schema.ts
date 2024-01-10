import { NewUserInput } from "@/protocols";
import Joi from "joi";

export const createUserSchema = Joi.object<NewUserInput>({
    name: Joi.string().min(3).required(),
    username: Joi.string().min(3).required(),
    password: Joi.string().min(6).required(),
})