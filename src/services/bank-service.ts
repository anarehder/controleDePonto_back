import { invalidParamError } from "@/errors";
import { SummaryReport, TotalWorkedHoursByMonth } from "@/protocols";
import { getMonthHoursByEmployeeRepository, getMonthWorkedHoursByEmployeeRespository, getSummaryReportRepository, getSummaryReportLastMonthRepository, getTodayHoursByEmployeeRepository, postBankControlRepository, updateBankControlRepository, updateTotalWorkedByDayRepository, getBankHoursRepository, updateBankHoursRepository, postBankHoursRepository } from "@/repositories";

export async function getTodayHoursService(employeeId:number, day: string): Promise <SummaryReport> {
    const today = new Date(day);
    const yearMonth = `${new Date().getFullYear()}-${new Date().getMonth() + 1}`;
    const yearLastMonth = calculateYearLastMonth(today);

    const hours = await getTodayHoursByEmployeeRepository(employeeId, today);
    const summary = await getSummaryReportRepository(employeeId,yearMonth);
    const lastMonth = await getSummaryReportLastMonthRepository(employeeId,yearLastMonth);

    const response = {hourControls: hours, bankHours: summary, bankBalanceLastMonth: lastMonth}
    return response;
}

export async function getMonthHoursService(employeeId:number, month: string) {
    const { startDate, endDate } = checkMonth(month);
    const completeReport = await getMonthHoursByEmployeeRepository(employeeId, startDate, endDate);
    return completeReport;
}

export async function postBankHourService(employeeId: number, day: Date, time: Date, type: string) {
    const dayZero = new Date(day);
    const registryExists = await getTodayHoursByEmployeeRepository(employeeId, dayZero);

    const formattedTime = `${day}T${time}Z`
    if (registryExists) {
        const formattedTime = `${day}T${time}Z`
        const data = {employeeId, day: new Date(day), [type]: new Date(formattedTime)};
        const hours = await updateBankControlRepository(registryExists.id, data);
        return hours;
    } else {
        const data = {employeeId, day: new Date(day), [type]: new Date(formattedTime), totalWorkedByDay: new Date(dayZero)};
        const hours = await postBankControlRepository(data);
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

export async function calculateHours(id: number, employeeId: number, day:Date) {
    //calculei o total do dia
    const workedTodayAmount = await updateTotalWorkedByDayRepository(id);
    
    //atualizar o do mês que estou alterando
    const updatedDate = new Date(day);
    const yearMonth = `${updatedDate.getUTCFullYear()}-${updatedDate.getUTCMonth() + 1}`;
    
    const { startDate, endDate } = checkMonth(yearMonth);
    const updatedMonthHours = await getMonthWorkedHoursByEmployeeRespository(employeeId, startDate, endDate); // pego a soma do mês
    const updatedMonthCalculatedHours = calculateWorkedMonthHours(updatedMonthHours); // converto a soma do trabalhado no mês
    const totalHoursUpdatedMonth = calculateMonthTotalHours(updatedMonthCalculatedHours); // calculo o saldo do mês
    const updatedMonthBalance = await calculateMonthBalance(updatedDate, employeeId, totalHoursUpdatedMonth);

    const registryExists = await getBankHoursRepository(employeeId, yearMonth);
    if (registryExists) {
        const data = {workedHoursByMonth: updatedMonthCalculatedHours, totalHoursByMonth: totalHoursUpdatedMonth, hoursBankBalance: updatedMonthBalance};
        const bankHours = await updateBankHoursRepository(registryExists.id, data);
        return {workedTodayAmount, bankHours};
    } else {
        const data = {employeeId, month: yearMonth, workedHoursByMonth: updatedMonthCalculatedHours, totalHoursByMonth: totalHoursUpdatedMonth, hoursBankBalance: updatedMonthBalance};
        const bankHours = await postBankHoursRepository(data);
        return {workedTodayAmount, bankHours};
    }
}

function calculateWorkedMonthHours(updatedMonthHours: TotalWorkedHoursByMonth[]){
    const totalInSeconds = Number(updatedMonthHours[0].totalWorkedSeconds);
    const hours = Math.floor(totalInSeconds / 3600);
    const minutes = Math.floor((totalInSeconds % 3600) / 60);
    const totalMonthHours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return totalMonthHours;
}

function calculateMonthTotalHours(updatedMonthCalculatedHours: string){
    const [hours, minutes] = updatedMonthCalculatedHours.split(':').map(Number);
    if (minutes === 0) {
        const diffHours = -(176 - hours);
        const calculatedMonthTotalHours = `${String(diffHours).padStart(2, '0')}:00`;
        return calculatedMonthTotalHours;
    } else {
        const diffMinutes = 60 - minutes;
        const diffHours = -(175 - hours);
        const calculatedMonthTotalHours = `${String(diffHours).padStart(2, '0')}:${String(diffMinutes).padStart(2, '0')}`;
        return calculatedMonthTotalHours;
    }
}

async function calculateMonthBalance (updatedDate: Date, employeeId: number, totalHoursUpdatedMonth: string) {
    const yearLastMonth = calculateYearLastMonth(updatedDate);
    const lastMonthBalance = await getSummaryReportLastMonthRepository(employeeId, yearLastMonth);//obter saldo mês anterior

    if (!lastMonthBalance || lastMonthBalance.hoursBankBalance === "0" || lastMonthBalance.hoursBankBalance === "00:00"){
        const monthBalance = totalHoursUpdatedMonth;
        return monthBalance;
    } else {
        const [hours, minutes] = totalHoursUpdatedMonth.split(':').map(Number);
        const formattedMinutes = Number(totalHoursUpdatedMonth.slice(0,1) + minutes);
        const [lastHours, lastMinutes] = lastMonthBalance.hoursBankBalance.split(':').map(Number);
        const formattedLastMinutes = Number(lastMonthBalance.hoursBankBalance.slice(0,1) + lastMinutes);

        const totalAmountInMinutes = (hours*60) + formattedMinutes + (lastHours*60) + formattedLastMinutes;

        const totalHours = (totalAmountInMinutes / 60).toFixed(2);
        const totalMinutes = totalAmountInMinutes % 60;
        const monthBalance =`${String(totalHours).slice(0,-3).padStart(2, '0')}:${String(totalMinutes).slice(1).padStart(2, '0')}`;
        return monthBalance;
    }
}

function calculateYearLastMonth(date: Date) {
    const fullDate = new Date(date);
    if (fullDate.getMonth() === 0){
        const yearLastMonth = `${fullDate.getFullYear()-1}-12`;
        return yearLastMonth;
    } else {
        const yearLastMonth = `${new Date().getFullYear()}-${new Date().getMonth()}`;
        return yearLastMonth;
    }
    
}