import { AuthenticatedRequest } from "@/middlewares";
import { NewRegistryInput, PostHoursCompleteReturn } from "@/protocols";
import { calculateHours, checkNextMonths, getMonthHoursService, getTodayHoursService, postBankHourService } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

export async function getTodayHoursController (req: AuthenticatedRequest, res: Response) {
    const { day } = req.params;
    const { employeeId } = req;
    try {
        const hours = await getTodayHoursService(employeeId, day);

        return res.status(httpStatus.OK).send(hours);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}

export async function getMonthHoursController (req: AuthenticatedRequest, res: Response) {
    const { month } = req.params;
    const { employeeId } = req;
    try {
        const hours = await getMonthHoursService(employeeId, month);
        return res.status(httpStatus.OK).send(hours);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}

export async function postBankHourController (req: AuthenticatedRequest, res: Response) {
    const { employeeId } = req;
    const { day, time, type } = req.body as NewRegistryInput;
    try {
        const hours = await postBankHourService(employeeId, day, time, type);
        if (hours.entry_time && hours.pause_time && hours.return_time && hours.exit_time) {
            const response: PostHoursCompleteReturn = await calculateHours(hours.id, employeeId, day);
            return res.status(httpStatus.OK).send(response);
        }
        return res.status(httpStatus.OK).send(hours);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}