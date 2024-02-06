import { conflictError, notFoundError } from "../errors";
import { EmployeeReturn } from "../protocols";
import { changePasswordRepository, createUserRepository, getUsersByUsernameRepository, getUsersListRepository } from "../repositories";
import bcrypt from "bcrypt";

export async function createUserService(employeeId: number, name: string, username: string, password: string): Promise<EmployeeReturn> {
    await validateUniqueUsername(username);
    const hashedPassword = await bcrypt.hash(password, 12);
    const data = {name, username, password: hashedPassword};
    const newUser = await createUserRepository(employeeId, data)
    const newUserReturn: EmployeeReturn = {id: newUser.id, name: newUser.name, username: newUser.username};
    return newUserReturn;
}

async function validateUniqueUsername(username: string) {
    const usernameExists = await getUsersByUsernameRepository(username);
    if (usernameExists) {
        throw conflictError("this username already exists");
    }
}

export async function getUsersService(): Promise<EmployeeReturn[]> {
    const users = await getUsersListRepository();
    const formattedUsers: EmployeeReturn[] = users.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
    }));
    return formattedUsers;
}

export async function changePasswordService(employeeId: number, username: string, password: string) {
    const user = await getUsersByUsernameRepository(username);
    if (!user) {
        throw notFoundError();
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await changePasswordRepository(employeeId, username, hashedPassword, user)
}