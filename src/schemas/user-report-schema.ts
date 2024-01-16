import { GetUserReportInput } from "../protocols";
import Joi from "joi";

export const getUserReportSchema = Joi.object<GetUserReportInput>({
    month: Joi.string().required(),
    employeeId: Joi.number().required(),
})