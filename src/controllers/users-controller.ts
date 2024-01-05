import { EmployeeReturn, NewUserInput } from "@/protocols";
import { createUserService } from "@/services";
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