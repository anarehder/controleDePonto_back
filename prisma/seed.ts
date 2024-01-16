import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();

async function main() {
    let adminUser = await prisma.user.findFirst({
        where: {
            username: "admin",
        }
    });
    if (!adminUser) {
        const username = "admin";
        const name = "admin";
        const password = "admin123";
        const hashedPassword = await bcrypt.hash(password, 12);
        const data = { name, username, password: hashedPassword };
        const createdAdmin = await prisma.user.create({
            data,
        });
        console.log(createdAdmin);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });