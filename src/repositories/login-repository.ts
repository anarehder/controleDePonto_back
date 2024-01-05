import { prisma } from "@/config";
import { SessionInput } from "@/protocols";

export async function createSessionRepository (data: SessionInput) {

    return prisma.session.create({
        data,
    });
}
