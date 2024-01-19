import bcrypt from "bcrypt";
import faker from "@faker-js/faker";
import { User } from "@prisma/client";
import { prisma } from "@/config";
import { func } from "joi";

export async function createUser(params: Partial<User> = {}): Promise<User> {
    const incomingPassword = params.password || "123456789";
    const hashedPassword = await bcrypt.hash(incomingPassword, 10);

    return await prisma.user.create({
        data: {
            username: params.username || faker.internet.userName(),
            name: params.name || faker.name.findName(),
            password: hashedPassword,
        },
    });
}

export function generateValidUserBody(params: Partial<User> = {}){
    const username = params.username || faker.internet.userName();
    const name = faker.name.findName();
    const password =  faker.internet.password(6);
    return {username, name, password};
}