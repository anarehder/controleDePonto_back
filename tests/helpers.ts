import * as jwt from "jsonwebtoken";
import { prisma } from "../src/config";
import { createSession } from "./factories/session-factory";
import { createUser } from "./factories/user-factory";
import { User } from "@prisma/client";

export async function cleanDb() {
    await prisma.session.deleteMany({});
    await prisma.hourControl.deleteMany({});
    await prisma.bankHours.deleteMany({});
    await prisma.user.deleteMany({});
}

export async function generateValidToken(user?: User) {
    const incomingUser = user || (await createUser());
    const token = jwt.sign({ employeeId: incomingUser.id }, process.env.JWT_SECRET);

    await createSession(token);

    return token;
}