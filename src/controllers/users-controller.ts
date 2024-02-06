import { AuthenticatedRequest } from "@/middlewares";
import { NewUserInput } from "../protocols";
import { changePasswordService, createUserService, getUsersService } from "../services";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function createUserController (req: Request, res: Response) {
    const { name, username, password } = req.body as NewUserInput;
    try {
        const newUser = await createUserService (name, username, password);
        return res.status(httpStatus.OK).send(newUser);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}

export async function getUsersController (req: Request, res: Response) {
    try {
        const users = await getUsersService();
        return res.status(httpStatus.OK).send(users);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}

export async function changePasswordController (req: AuthenticatedRequest, res: Response) {
    const employeeId = req.employeeId;
    const { username, password } = req.body as NewUserInput;
    try {
        await changePasswordService (employeeId, username, password);
        return res.status(httpStatus.OK).send('new password ok!');
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}