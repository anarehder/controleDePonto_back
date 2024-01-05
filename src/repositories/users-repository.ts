import { prisma } from "@/config";
import { NewUserInput } from "@/protocols";


export async function getUsersListRepository () {
    return prisma.user.findMany();
}

export async function getUsersByIdRepository(employeeId: number) {
    return prisma.user.findFirst({
        where: {
            id: employeeId,
        }
    });
}

export async function getUsersByUsernameRepository(username: string) {
    const user = prisma.user.findFirst({
        where: {
            username,
        }
    });
    return user; 
}

export async function createUserRepository (data: NewUserInput) {
    return prisma.user.create({
        data,
    });
}