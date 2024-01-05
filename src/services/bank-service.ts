import { invalidDataError, invalidParamError } from "@/errors";
import { getTodayHoursByEmployeeRepository } from "@/repositories";

export async function getTodayHoursService(employeeId:number, today: Date) {
    const hours = await getTodayHoursByEmployeeRepository(employeeId, today);

    return hours ? [hours] : [];
}

export async function getMonthHoursService(employeeId:number, month: string) {
    const { startDate, endDate } = checkMonth(month);
    console.log(startDate, endDate);
}

function checkMonth (yearMonth: string) {
    const [year, month] = yearMonth.split('-').map(Number);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        throw invalidParamError("invalid year/month");
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return { startDate, endDate }
}