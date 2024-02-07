import { prisma } from "../config";

export async function sessionRepository (token: string) {
    const sessionWithUsername  = await prisma.session.findFirst({
        where:{
            token,
        },
        include: {
            User: {
                select: {
                    username: true,
                    name: true,
                },
            }
        }
    });

    return sessionWithUsername ;
}