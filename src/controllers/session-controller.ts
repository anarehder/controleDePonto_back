import { SessionParams } from "../protocols";
import { sessionService } from "../services";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function sessionController(req: Request, res: Response) {
    const { username, token } = req.body as SessionParams;
    try {
        const session = await sessionService(username, token);
        return res.status(httpStatus.OK).send(session);
    } catch (error) {
        if (error.name === "invalidCredentialsError") {
            return res.status(httpStatus.UNAUTHORIZED).send(error);
        }
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}
