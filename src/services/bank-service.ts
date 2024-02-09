import moment from "moment";
import { conflictError, invalidParamError } from "../errors";
import { FullReport, NewBankHoursRegistry, PostHoursCompleteReturn, SummaryReport, UpdateBankHoursRegistry } from "../protocols";
import { getMonthHoursByEmployeeRepository, getSummaryReportRepository, getSummaryReportMonthRepository, getTodayHoursByEmployeeRepository, postBankControlRepository, updateBankControlRepository, updateTotalWorkedByDayRepository, getBankHoursRepository, updateBankHoursRepository, postBankHoursRepository, getSummaryReportHoursByMonthRepository, deleteHoursRepository, getHoursByIdRepository, getIncompleteHoursByEmployeeRepository } from "../repositories";
import { calculateFullBalance, calculateMonthHoursService } from "./hours-service";
import { getUsersService } from "./users-service";

export async function getTodayHoursService(employeeId:number, day: string): Promise <SummaryReport> {
    const today = new Date(day);
    const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const lastMonth = getLastMonth(yearMonth);
    
    const hours = await getTodayHoursByEmployeeRepository(employeeId, today);
    const summary = await getSummaryReportRepository(employeeId,yearMonth);
    const lastMonthFullBalance = await getSummaryReportMonthRepository(employeeId,lastMonth); //fullBalance mês anterior

    const response = {hourControls: hours, bankHours: summary, bankBalanceLastMonth: lastMonthFullBalance};
    return response;
}

export async function getMonthHoursService(employeeId:number, yearMonth: string) {
    const { startDate, endDate } = getStartEndDate(yearMonth);
    const lastMonth = getLastMonth(yearMonth);
    const completeReport = await getMonthHoursByEmployeeRepository(employeeId, startDate, endDate); // todas as horas do mês atual
    const summary = await getSummaryReportRepository(employeeId, yearMonth); // geral mês atual
    const lastMonthFullBalance = await getSummaryReportMonthRepository(employeeId,lastMonth); //fullBalance mês anterior
    const response = {hourControls: completeReport, bankHours: summary, bankBalanceLastMonth: lastMonthFullBalance};
    return response;
}

export async function getGeneralMonthHoursService(month: string){
    const employees = await getUsersService();
    const fullReport: FullReport[] = [];
    for (const employee of employees) {
        const { id } = employee;
        const report = await getMonthHoursService(id, month);
        const object = {...employee, report: report};
        fullReport.push(object);
    }
    return fullReport;
}

export async function postBankHourService(employeeId: number, day: Date, time: Date, type: string) {
    const dayZero = new Date(day);
    const registries = await getTodayHoursByEmployeeRepository(employeeId, dayZero);
    const uncompletedRegistry = await getIncompleteHoursByEmployeeRepository(employeeId, dayZero);
    const formattedTime = `${day}T${time}Z`
    registries.forEach(r => {
        if (r.entry_time < new Date(formattedTime) && new Date(formattedTime) < r.exit_time) {
            throw conflictError("Choose a time outside your already worked time");
        }
    });
    if (uncompletedRegistry) {
        if (type === "exit_time" && uncompletedRegistry.entry_time && !uncompletedRegistry.exit_time){
            if (new Date(uncompletedRegistry.entry_time) > new Date(formattedTime)){
                throw conflictError("incompatible hours");
            }
            const diffInDays = moment(formattedTime).diff(moment(uncompletedRegistry.entry_time), 'days');
            if (diffInDays > 1){
                throw conflictError("Check dates, more than 1 day in difference");
            }
            if (diffInDays === 1) {
                const startOfDay = `${day}T00:00:00Z`;

                const data1 = {employeeId, day: uncompletedRegistry.day, entry_time: uncompletedRegistry.entry_time, [type]: new Date(startOfDay)};
                const hours = await updateBankControlRepository(uncompletedRegistry.id, data1);

                const data2 = {employeeId, day: new Date(day), entry_time: new Date(startOfDay), [type]: new Date(formattedTime), totalWorkedByDay: new Date(formattedTime)};
                await postBankControlRepository(data2);

                return hours;
            }
            if (diffInDays === 0) {
                const data = {employeeId, day: new Date(day), entry_time: uncompletedRegistry.entry_time, [type]: new Date(formattedTime)};
                const hours = await updateBankControlRepository(uncompletedRegistry.id, data);
                return hours;
            }
        }
        if (type === "exit_time" && uncompletedRegistry.entry_time && uncompletedRegistry.exit_time){
            throw conflictError("Insert an entry time first to start a new registry");
        }
        if (type === "entry_time" && uncompletedRegistry.entry_time && !uncompletedRegistry.exit_time){
            throw conflictError("Complete the last registry before start another one");
        }
    } 
    if (!uncompletedRegistry && type==="exit_time") {
        throw conflictError("Insert an entry time first!");
    }
    if (!uncompletedRegistry && type==="entry_time")  {
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

export function getLastMonth(month: string){
    const thisMonth = moment(month, 'YYYY-MM');
    const lastMonth = thisMonth.subtract(1, 'months');

    const latMonthFormatted = lastMonth.format('YYYY-MM');
    return latMonthFormatted;
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

export async function updateFullBalanceNextMonths(yearMonth: string, employeeId: number) {
    const today = moment();
    const thisMonth = moment(yearMonth, 'YYYY-MM');

    if(today.isAfter(thisMonth, 'month')){
        const nextMonth = thisMonth.add(1, 'months');
        const nextMonthFormatted = nextMonth.format('YYYY-MM');
        await calculateNextMonthsFullBalance(nextMonthFormatted, employeeId);
    }
}

async function calculateNextMonthsFullBalance(nextMonth: string, employeeId: number ) {
    const thisYearMonth = `${String(nextMonth).padStart(2, '0')}`;
    const { totalHoursByMonth } = await getSummaryReportHoursByMonthRepository(employeeId, thisYearMonth);
    if (totalHoursByMonth !== "00:00"){
        const monthFullBalance = await calculateFullBalance(employeeId, thisYearMonth, totalHoursByMonth);
        const bankHoursData = { hoursBankBalance: monthFullBalance };
        await checkBankHoursRegistry(employeeId, thisYearMonth, bankHoursData);
    }
}

export async function deleteHoursService(hourControlId: number, employeeId: number) {
    const registryExists = await getHoursByIdRepository(hourControlId);
    if (!registryExists) {
        throw conflictError("This registry ID does not exist!");
    }
    await deleteHoursRepository(hourControlId, employeeId, registryExists);
}