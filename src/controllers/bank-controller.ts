import { AuthenticatedRequest } from "../middlewares";
import { GetUserReportInput, NewRegistryInput } from "../protocols";
import { updateBankHours, getMonthHoursService, getTodayHoursService, postBankHourService, getGeneralMonthHoursService } from "../services";
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
    const employeeId = req.employeeId;
    const { day, time, type } = req.body as NewRegistryInput;

    const today = new Date();
    const dataLimite = new Date();
    dataLimite.setDate(today.getDate() - 10);
    const dataTeste = new Date(day);
    if (dataTeste < dataLimite){
        return res.status(httpStatus.UNAUTHORIZED).send("Não é possível alterar/adicionar datas anteriores a 10 dias atrás");
    }
    try {
        const hours = await postBankHourService(employeeId, day, time, type);
        const fullRegistry = (hours.entry_time !== null) && (hours.exit_time !== null);
        if (fullRegistry) {
            const response = await updateBankHours(hours.id, employeeId, day);
            return res.status(httpStatus.OK).send(response);
        }
        return res.status(httpStatus.OK).send(hours);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}

export async function getUserReportController (req: AuthenticatedRequest, res: Response) {
    const { month, employeeId } = req.body as GetUserReportInput;
    try {
        const hours = await getMonthHoursService(employeeId, month);
        return res.status(httpStatus.OK).send(hours);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}

export async function getGeneralReportController (req: AuthenticatedRequest, res: Response) {
    const { month, employeeId } = req.body as GetUserReportInput;
    if (employeeId !== 1) {
        return res.status(httpStatus.UNAUTHORIZED).send("Only admin user can use this route");
    }
    try {
        const fullReport = await getGeneralMonthHoursService(month);
        return res.status(httpStatus.OK).send(fullReport);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}