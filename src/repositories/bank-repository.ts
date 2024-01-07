import { prisma } from "@/config";
import { LastMonthBalance, NewRegistry, UpdateRegistry } from "@/protocols";
import { BankHours, HourControl } from "@prisma/client";

export async function getTodayHoursByEmployeeRepository(employeeId: number, today: Date): Promise <HourControl> {
    return await prisma.hourControl.findFirst({
        where: {
            employeeId,
            day: {
                equals: today,
            },
        },
    });
}

export async function getMonthHoursByEmployeeRepository(employeeId: number, startDate: Date, endDate: Date): Promise <HourControl[]> {
    return await prisma.hourControl.findMany({
        where: {
            employeeId,
            day: {
                gte: startDate,
                lte: endDate,
            },
        },
    });
}

export async function getSummaryReport(employeeId: number, yearMonth: string): Promise <BankHours> {
    return await prisma.bankHours.findFirst({
        where: {
            employeeId,
            month: {
                equals: yearMonth,
            },
        },
    });
}

export async function getSummaryReportLastMonth(employeeId: number, yearMonth: string): Promise<LastMonthBalance> {
    return await prisma.bankHours.findFirst({
        where: {
            employeeId,
            month: {
                equals: yearMonth,
            },
        },
        select: {
            hoursBankBalance: true,
        },
    });
}

export async function postBankHoursRepository(data: NewRegistry): Promise<HourControl> {
    return await prisma.hourControl.create({
        data
    });
}

export async function updateBankHoursRepository(id: number, data: UpdateRegistry): Promise<HourControl> {
    return await prisma.hourControl.update({
        where: {
            id,
        },
        data
    });
}

export async function updateTotalWorkedByDayRepository(id: number): Promise<HourControl> {
    await prisma.$queryRaw`
    UPDATE hourControl
    SET totalWorkedByDay = SEC_TO_TIME(
        TIME_TO_SEC(TIMEDIFF(pause_time, entry_time)) + TIME_TO_SEC(TIMEDIFF(exit_time, return_time))
    )
    WHERE id = ${id} `

    const updatedData = await prisma.hourControl.findUnique({
        where: { id },
    });

    const dia = updatedData.day.getUTCDate();
    const novaData = new Date(updatedData.totalWorkedByDay);
    novaData.setDate(dia);

    await prisma.$queryRaw`
    UPDATE hourControl
    SET totalWorkedByDay = ${novaData}
    WHERE id = ${id}`;

    return await prisma.hourControl.findUnique({
        where: { id },
    });
}

export async function getMonthWorkedHoursByEmployeeRespository(employeeId: number, startDate: Date, endDate: Date) {
    await prisma.$queryRaw`
        SELECT SUM(totalWorkedByDay) as total 
        FROM HourControl 
        WHERE employeeId = ${employeeId} 
        AND day BETWEEN ${startDate} AND ${endDate}`
}