import { invalidParamError } from "@/errors";
import { SummaryReport } from "@/protocols";
import { getMonthHoursByEmployeeRepository, getSummaryReport, getSummaryReportLastMonth, getTodayHoursByEmployeeRepository, postBankHoursRepository, updateBankHoursRepository, updateTotalWorkedByDayRepository } from "@/repositories";

export async function getTodayHoursService(employeeId:number, today: Date): Promise <SummaryReport> {
    const yearMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;
    const yearLastMonth = `${today.getFullYear()}-${today.getMonth()}`;
    const hours = await getTodayHoursByEmployeeRepository(employeeId, today);
    const summary = await getSummaryReport(employeeId,yearMonth);
    const lastMonth = await getSummaryReportLastMonth(employeeId,yearLastMonth);

    const response = {hourControls: hours, bankHours: summary, bankBalanceLastMonth: lastMonth}
    return response;
}

export async function getMonthHoursService(employeeId:number, month: string) {
    const { startDate, endDate } = checkMonth(month);
    const completeReport = await getMonthHoursByEmployeeRepository(employeeId, startDate, endDate);
    return completeReport;
}

export async function postBankHourService(employeeId: number, day: Date, time: Date, type: string) {
    const registryExists = await getTodayHoursByEmployeeRepository(employeeId, new Date(day));

    const formattedTime = `${day}T${time}Z`
    if (registryExists) {
        const data = {employeeId, day: new Date(day), [type]: new Date(formattedTime)};
        const hours = await updateBankHoursRepository(registryExists.id, data);
        return hours;
    } else {
        const totalWorkedByDay = `${day}T00:00:00Z`
        const data = {employeeId, day: new Date(day), [type]: new Date(formattedTime), totalWorkedByDay: new Date(totalWorkedByDay)};
        const hours = await postBankHoursRepository(data);
        return hours;
    }
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

export async function calculateHours(id: number) {
    const result = await updateTotalWorkedByDayRepository(id);
    return result;
}

export async function calculateMonthHours (yearMonth: string) {
    const { startDate, endDate } = checkMonth(yearMonth);
}
// juntar todas as totalworkedbyday e somar elas mas também dos meses seguintes
// worked é o total
// total é worked -176
// balance é o mês anterior + total worked (todos da mesma tabela)
// seria melhor ter uma linha mês anterior?