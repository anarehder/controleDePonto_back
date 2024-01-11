import { Session } from "@prisma/client";
import { createUser } from "./user-factory";
import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createSession(token: string): Promise<Session> {
    const user = await createUser();

    return prisma.session.create({
        data: {
            token: token,
            employeeId: user.id,
        },
    });
}

export function generateLoginBody(){
    const username = faker.internet.userName();
    const password =  faker.internet.password(6);
    return {username, password};
}