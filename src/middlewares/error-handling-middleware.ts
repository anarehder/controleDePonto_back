import { ApplicationError } from "@/protocols";
import { Request, Response } from "express";
import httpStatus from "http-status";

export function handleApplicationErrors(err: ApplicationError | Error, _req: Request, res: Response) {
    if (err.name === "CannotGetData") {
        return res.status(httpStatus.BAD_REQUEST).send({
            message: err.message,
        });
    }

    if (err.name === "ConflictError") {
        return res.status(httpStatus.CONFLICT).send({
            message: err.message,
        });
    }

    if (err.name === "UnauthorizedError" || err.name === "InvalidCredentialsError") {
        return res.status(httpStatus.UNAUTHORIZED).send({
            message: err.message,
        });
    }

    if (err.name === "NotFoundError") {
        return res.status(httpStatus.NOT_FOUND).send({
            message: err.message,
        });
    }

    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        error: "InternalServerError",
        message: "Internal Server Error",
    });
}
