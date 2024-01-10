import { prisma } from "@/config";
import { MonthBalance, MonthTotalHours, NewBankHoursRegistry, NewRegistry, TotalWorkedHoursByMonth, UpdateBankHoursRegistry, UpdateRegistry } from "@/protocols";
import { BankHours, HourControl } from "@prisma/client";

export async function getTodayHoursByEmployeeRepository(employeeId: number, day: Date): Promise<HourControl | null> {
    const result = await prisma.hourControl.findFirst({
        where: {
            employeeId,
            day,
        }
    })
    return result || null;
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
        orderBy: {
            day: 'desc',
        },
    });
}

export async function getSummaryReportRepository(employeeId: number, yearMonth: string): Promise <BankHours> {
    return await prisma.bankHours.findFirst({
        where: {
            employeeId,
            month: {
                equals: yearMonth,
            },
        },
    });
}

export async function getSummaryReportMonthRepository(employeeId: number, yearMonth: string): Promise<MonthBalance> {
    const result = await prisma.bankHours.findFirst({
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
    return result || { hoursBankBalance: "00:00" };
}

export async function getSummaryReportHoursByMonthRepository(employeeId: number, yearMonth: string): Promise<MonthTotalHours> {
    const result = await prisma.bankHours.findFirst({
        where: {
            employeeId,
            month: {
                equals: yearMonth,
            },
        },
        select: {
            totalHoursByMonth: true,
        },
    });
    return result || { totalHoursByMonth: "00:00" };
}

export async function postBankControlRepository(data: NewRegistry): Promise<HourControl> {
    return await prisma.hourControl.create({
        data
    });
}

export async function updateBankControlRepository(id: number, data: UpdateRegistry): Promise<HourControl> {
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

export async function getMonthWorkedHoursByEmployeeRespository(employeeId: number, startDate: Date, endDate: Date): Promise<TotalWorkedHoursByMonth[]> {
    return await prisma.$queryRaw`
        SELECT employeeId, SUM(TIME_TO_SEC(totalWorkedByDay)) AS totalWorkedSeconds
        FROM HourControl
        WHERE employeeId = ${employeeId} AND day BETWEEN ${startDate} AND ${endDate}
        GROUP BY employeeId`
}

export async function postBankHoursRepository (data: NewBankHoursRegistry): Promise<BankHours>  {
    return await prisma.bankHours.create({
        data
    })
}

export async function updateBankHoursRepository (id: number, data: UpdateBankHoursRegistry): Promise<BankHours> {
    return await prisma.bankHours.update({
        where: {
            id,
        },
        data
    })
}

export async function getBankHoursRepository (employeeId: number, month: string): Promise<BankHours> {
    return await prisma.bankHours.findFirst({
        where: {
            employeeId,
            month
        },
    })
}