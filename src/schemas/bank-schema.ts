import { NewRegistry } from "@/protocols";
import Joi from "joi";

export const addRegistrySchema = Joi.object<NewRegistry>({
    employeeId: Joi.number().required(),
    date: Joi.string().isoDate().required(),
    time: Joi.string().isoDate().required(),
})