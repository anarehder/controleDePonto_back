import { LoginParams } from "../protocols";
import { deleteSessionService, loginService } from "../services";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function loginController(req: Request, res: Response) {
    const { username, password } = req.body as LoginParams;
    try {
        const loginReturn = await loginService(username, password);
        return res.status(httpStatus.OK).send(loginReturn);
    } catch (error) {
        if (error.name === "invalidCredentialsError") {
            return res.status(httpStatus.UNAUTHORIZED).send(error);
        }
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}

export async function logoutController(req: Request, res: Response) {
    const userToken = req.headers.authorization;
    try {
        await deleteSessionService(userToken);
        return res.status(httpStatus.OK).send("logout Completed");
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}

function next(customError: Error) {
    throw new Error("Function not implemented.");
}
