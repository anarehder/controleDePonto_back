import { prisma } from "@/config";
import { HourControl } from "@prisma/client";

export async function getTodayHoursByEmployeeRepository(employeeId: number, today: Date): Promise <HourControl> {
    return prisma.hourControl.findFirst({
        where: {
            employeeId,
            day: {
                equals: today,
            },
        },
    });
}