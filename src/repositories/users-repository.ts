import { prisma } from "../config";
import { NewUserInput } from "../protocols";
import { User } from "@prisma/client";


export async function getUsersListRepository () : Promise <User[] | null> {
    return await prisma.user.findMany();
}

export async function getUsersByIdRepository(employeeId: number): Promise <User | null> {
    return await prisma.user.findFirst({
        where: {
            id: employeeId,
        }
    });
}

export async function getUsersByUsernameRepository(username: string): Promise <User | null> {
    const user = await prisma.user.findFirst({
        where: {
            username,
        }
    });
    return user; 
}

export async function createUserRepository (employeeId: number, data: NewUserInput): Promise <User> {
    const user = await prisma.user.create({
        data,
    });

    await prisma.logOperation.create({
        data: {
            employeeId: employeeId,
            tableChanged: "user",
            operation: "INSERT",
            newValue: JSON.stringify(user),
        }
    });
    return user;
}

export async function changePasswordRepository(employeeId: number, username: string, password: string, user: User) {
    await prisma.user.update({
        where: {
            username: username,
        },
        data: {
            password: password,
        },
    });

    const newUserValue = await prisma.user.findFirst({
        where: {
            username,
        }
    });

    await prisma.logOperation.create({
        data: {
            employeeId: employeeId,
            tableChanged: "user",
            operation: "UPDATE",
            lastValue: JSON.stringify(user),
            newValue: JSON.stringify(newUserValue),
        }
    });
}