import { invalidCredentialsError } from "@/errors";
import { EmployeeReturn, LoginParams } from "@/protocols";
import { createSessionRepository } from "@/repositories";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

async function loginService(params: LoginParams): Promise<EmployeeReturn> {
    const { username, password } = params;

    const employee = await getUserOrFail(email);

    await validatePassword(password, employee.password);

    const token = await createSession(employee.id);

    return {
        employee.id,
        employee.username,
        employee.name,
        token,
    };
}

async function createSession(employeeId: number) {
    const token = jwt.sign({ employeeId }, process.env.JWT_SECRET);
    const data = {employeeId,token}
    await createSessionRepository(data);

    return token;
}

async function validatePassword(password: string, userPassword: string) {
    const isPasswordValid = await bcrypt.compare(password, userPassword);
    if (!isPasswordValid) throw invalidCredentialsError();
}