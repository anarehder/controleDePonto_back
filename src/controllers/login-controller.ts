import { LoginParams } from "@/protocols";
import { Request, Response } from "express";
import httpStatus from "http-status";

export async function loginController(req: Request, res: Response) {
    const { username, password } = req.body as LoginParams;
    try {
        return res.status(httpStatus.OK).send([username, password]);
    } catch (error) {
        return res.status(httpStatus.UNAUTHORIZED).send(error);
    }
}