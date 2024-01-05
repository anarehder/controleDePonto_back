import { LoginParams } from "@/protocols";
import { loginService } from "@/services";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function loginController(req: Request, res: Response) {
    const { username, password } = req.body as LoginParams;
    try {
        const loginReturn = await loginService(username, password);
        return res.status(httpStatus.OK).send(loginReturn);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}