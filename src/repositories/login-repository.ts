import { prisma } from "../config";
import { SessionInput } from "../protocols";

export async function createSessionRepository (data: SessionInput) {
    const session = await prisma.session.create({
        data,
    });

    await prisma.logOperation.create({
        data: {
            employeeId: session.employeeId,
            tableChanged: "session",
            operation: "INSERT",
            newValue: JSON.stringify(session),
        }
    });

    return session;
}


export async function deleteSessionRepository (token: string) {
    const session = await prisma.session.findFirst({
        where: {
            token,
        }
    });
    const deleted = await prisma.session.delete({
        where: {
            token,
        }
    })

    await prisma.logOperation.create({
        data: {
            employeeId: deleted.employeeId,
            tableChanged: "user",
            operation: "UPDATE",
            lastValue: JSON.stringify(session),
        }
    });

    return deleted;
}
