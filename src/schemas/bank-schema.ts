import { NewRegistryInput } from "@/protocols";
import Joi from "joi";

export const addRegistrySchema = Joi.object<NewRegistryInput>({
    day: Joi.string().isoDate().required(),
    time: Joi.string(),
    type: Joi.string().valid('entry_time', 'pause_time', 'return_time', 'exit_time').required(),
})