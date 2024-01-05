import { prisma } from "@/config";
import { Prisma } from "@prisma/client";

export async function createSessionRepository (data: Prisma.SessionCreateInput) {
    return prisma.session.create({
        data,
    });
}
