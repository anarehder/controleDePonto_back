import { invalidCredentialsError } from "../errors";
import { EmployeeLogin } from "../protocols";
import { createSessionRepository, deleteSessionRepository, getUsersByUsernameRepository } from "../repositories";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function loginService(username: string, password: string): Promise<EmployeeLogin> {
    const employee = await getUsersByUsernameRepository(username);

    await validatePassword(password, employee.password);

    const token = await createSession(employee.id);
    const fullResponse: EmployeeLogin = {
                        id: employee.id,
                        username: employee.username,
                        name: employee.name,
                        token
    }
    return (fullResponse);
}

async function createSession(employeeId: number) {
    const token = jwt.sign({ employeeId }, process.env.JWT_SECRET);
    const data = {employeeId, token};
    await createSessionRepository(data);

    return token;
}

async function validatePassword(password: string, userPassword: string) {
    const isPasswordValid = await bcrypt.compare(password, userPassword);
    if (!isPasswordValid) throw invalidCredentialsError();
}

export async function deleteSessionService(userToken: string) {
    const token = userToken.slice(7);
    await deleteSessionRepository(token);

    return token;
}