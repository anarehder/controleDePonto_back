import { SessionParams } from "../protocols";
import Joi from "joi";

export const sessionSchema = Joi.object<SessionParams>({
    username: Joi.string().min(3).required(),
    token: Joi.string().min(6).required(),
})