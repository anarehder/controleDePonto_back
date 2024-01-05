import { AuthenticatedRequest } from "@/middlewares";
import { getMonthHoursService, getTodayHoursService } from "@/services";
import { Response } from "express";
import httpStatus from "http-status";

export async function getTodayHoursController (req: AuthenticatedRequest, res: Response) {
    const today = new Date();
    const { employeeId } = req;
    try {
        const hours = await getTodayHoursService(employeeId, today);

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
        return res.sendStatus(httpStatus.OK);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}