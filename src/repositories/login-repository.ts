import { prisma } from "@/config";
import { SessionInput } from "@/protocols";

export async function createSessionRepository (data: SessionInput) {

    return prisma.session.create({
        data,
    });
}


export async function deleteSessionRepository (token: string) {
    return prisma.session.delete({
        where: {
            token,
        }
    })
}
