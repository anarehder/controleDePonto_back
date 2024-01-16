import { prisma } from "../config";
import { NewUserInput } from "../protocols";
import { User } from "@prisma/client";


export async function getUsersListRepository () : Promise <User[] | null> {
    return prisma.user.findMany();
}

export async function getUsersByIdRepository(employeeId: number): Promise <User | null> {
    return prisma.user.findFirst({
        where: {
            id: employeeId,
        }
    });
}

export async function getUsersByUsernameRepository(username: string): Promise <User | null> {
    const user = prisma.user.findFirst({
        where: {
            username,
        }
    });
    return user; 
}

export async function createUserRepository (data: NewUserInput): Promise <User> {
    return prisma.user.create({
        data,
    });
}