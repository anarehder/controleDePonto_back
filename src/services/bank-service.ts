import { conflictError, invalidParamError } from "../errors";
import { NewBankHoursRegistry, PostHoursCompleteReturn, SummaryReport, UpdateBankHoursRegistry } from "../protocols";
import { getMonthHoursByEmployeeRepository, getSummaryReportRepository, getSummaryReportMonthRepository, getTodayHoursByEmployeeRepository, postBankControlRepository, updateBankControlRepository, updateTotalWorkedByDayRepository, getBankHoursRepository, updateBankHoursRepository, postBankHoursRepository, getSummaryReportHoursByMonthRepository } from "../repositories";
import { calculateFullBalance, calculateMonthHoursService } from "./hours-service";

export async function getTodayHoursService(employeeId:number, day: string): Promise <SummaryReport> {
    const today = new Date(day);
    const yearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = calculateLastMonthString(yearMonth);

    const hours = await getTodayHoursByEmployeeRepository(employeeId, today);
    const summary = await getSummaryReportRepository(employeeId,yearMonth);
    const lastMonthFullBalance = await getSummaryReportMonthRepository(employeeId,lastMonth); //fullBalance mês anterior

    const response = {hourControls: hours, bankHours: summary, bankBalanceLastMonth: lastMonthFullBalance};
    return response;
}

export async function getMonthHoursService(employeeId:number, yearMonth: string) {
    const { startDate, endDate } = getStartEndDate(yearMonth);
    const lastMonth = calculateLastMonthString(yearMonth);
    const completeReport = await getMonthHoursByEmployeeRepository(employeeId, startDate, endDate); // todas as horas do mês atual
    const summary = await getSummaryReportRepository(employeeId, yearMonth); // geral mês atual
    const lastMonthFullBalance = await getSummaryReportMonthRepository(employeeId,lastMonth); //fullBalance mês anterior
    const response = {hourControls: completeReport, bankHours: summary, bankBalanceLastMonth: lastMonthFullBalance};
    return response;
}

export async function postBankHourService(employeeId: number, day: Date, time: Date, type: string) {
    const dayZero = new Date(day);
    const registryExists = await getTodayHoursByEmployeeRepository(employeeId, dayZero);

    const formattedTime = `${day}T${time}Z`
    if (registryExists) {
        const formattedTime = `${day}T${time}Z`
        const data = {employeeId, day: new Date(day), [type]: new Date(formattedTime)};
        //fazer a verificação
        if (type === "exit_time" && registryExists.entry_time){
            if (new Date(registryExists.entry_time) > new Date(formattedTime)){
                throw conflictError("incompatible hours");
            }
        }
        const hours = await updateBankControlRepository(registryExists.id, data);
        return hours;
    } else {
        const data = {employeeId, day: new Date(day), [type]: new Date(formattedTime), totalWorkedByDay: new Date(dayZero)};
        const hours = await postBankControlRepository(data);
        return hours;
    }
}

export async function updateBankHours(id: number, employeeId: number, day:Date): Promise<PostHoursCompleteReturn> {
    //calculei e atualizei o total do dia (a query faz pra mim a soma?)
    const workedTodayAmount = await updateTotalWorkedByDayRepository(id);
    //atualizar o do mês que estou alterando
    const updatedDate = new Date(day);
    const yearMonth = `${updatedDate.getUTCFullYear()}-${(updatedDate.getUTCMonth() + 1).toString().padStart(2, '0')}`;
    const { startDate, endDate } = getStartEndDate(yearMonth);

    const bankHoursData = await calculateMonthHoursService(employeeId, startDate, endDate, yearMonth);
    const bankHours = await checkBankHoursRegistry(employeeId, yearMonth,bankHoursData);
    await updateFullBalanceNextMonths(yearMonth, employeeId); 
    return {workedTodayAmount, bankHours};
}

export function calculateLastMonthString(yearMonth: string) {
    const [year, month] = yearMonth.split("-").map(Number);
    if (month === 1){
        const yearLastMonth = `${year-1}-12`;
        return yearLastMonth;
    } else {
        const yearLastMonth = `${year}-${String(month-1).padStart(2, '0')}`;
        return yearLastMonth;
    }
}

function getStartEndDate (yearMonth: string) {
    const [year, month] = yearMonth.split('-').map(Number);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        throw invalidParamError("invalid year/month");
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0));

    return { startDate, endDate }
}

async function checkBankHoursRegistry(employeeId: number, yearMonth: string, inputData: NewBankHoursRegistry | UpdateBankHoursRegistry){
    const registryExists = await getBankHoursRepository(employeeId, yearMonth);
    if (registryExists) {
        const bankHours = await updateBankHoursRepository(registryExists.id, inputData);//atualizei o mês em que um novo ponto completo foi inserido
        return bankHours; 
    } else {
        const data = {employeeId, month: yearMonth, workedHoursByMonth: inputData.workedHoursByMonth, totalHoursByMonth: inputData.totalHoursByMonth, hoursBankBalance: inputData.hoursBankBalance};
        const bankHours = await postBankHoursRepository(data); //criei o mês em que um novo ponto completo foi inserido
        return bankHours;
    }
}

// conferir se tem meses subsequentes para alterar também...
export async function updateFullBalanceNextMonths(yearMonth: string, employeeId: number) {
    const today = new Date();
    const [year, month] = yearMonth.split("-").map(Number);
    const monthDifference = ((today.getFullYear() - year) * 12) + ((today.getMonth() + 1) - month);

    for (let i = 1; i < monthDifference + 1; i++) {
        const testMonth = month + i;
        if ((testMonth / 12) > 1) {
            const thisYear = year + 1;
            const thisMonth = testMonth % 12;
            await calculateNextMonthsFullBalance(thisYear, thisMonth, employeeId);
        } else {
            await calculateNextMonthsFullBalance(year, testMonth, employeeId);
        }
    }
}

async function calculateNextMonthsFullBalance(thisYear: number, thisMonth: number, employeeId: number ) {
    const thisYearMonth = `${thisYear}-${String(thisMonth).padStart(2, '0')}`;
    //pegar o monthBalance do mês em que vou atualizar (nextYearMonth)
    const { totalHoursByMonth } = await getSummaryReportHoursByMonthRepository(employeeId, thisYearMonth);
    const monthFullBalance = await calculateFullBalance(employeeId, thisYearMonth, totalHoursByMonth);
    const bankHoursData = { hoursBankBalance: monthFullBalance };
    const bankHours = await checkBankHoursRegistry(employeeId, thisYearMonth, bankHoursData);
    return bankHours;
}