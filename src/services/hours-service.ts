import { TotalWorkedHoursByMonth } from "../protocols";
import { getMonthWorkedHoursByEmployeeRespository, getSummaryReportMonthRepository } from "../repositories";
import { getLastMonth } from "./bank-service";

export async function calculateMonthHoursService (employeeId: number, startDate: Date, endDate: Date, yearMonth: string){
    // pegar por funcionário a somatória de horas trabalhadas por dia agrupadas em totalWorkedSeconds; 
    const monthAmountWorkedSeconds = await getMonthWorkedHoursByEmployeeRespository(employeeId, startDate, endDate); 
    //transformo o total em horas trabalhadas
    const monthAmountWorkedHours = transformSecondsToHours(monthAmountWorkedSeconds);
    //calculo o saldo do mês (desconto 176h)
    const monthBalance = calculateMonthTotalHours(monthAmountWorkedHours);
    //calcular o saldo geral (considerando saldo geral mês anterior + saldo mês atual = saldo geral mês atual )
    const monthFullBalance = await calculateFullBalance(employeeId, yearMonth, monthBalance);
    //devolver no formato que preciso para inserir no banco.
    const bankHoursData = {workedHoursByMonth: monthAmountWorkedHours, totalHoursByMonth: monthBalance, hoursBankBalance: monthFullBalance};
    return bankHoursData;
}

//recebo quantos segundos trabalhei por dia e devolvo em horas dentro da string
export function transformSecondsToHours(monthHours: TotalWorkedHoursByMonth[]) {
    const totalInSeconds = Number(monthHours[0].totalWorkedSeconds);
    const hours = Math.floor(totalInSeconds / 3600);
    const minutes = Math.floor((totalInSeconds % 3600) / 60);
    const totalMonthHours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    return totalMonthHours;
}

//calculo a soma do mês (diminuindo 176h)
function calculateMonthTotalHours(monthAmountWorkedHours: string){
    const [hours, minutes] = monthAmountWorkedHours.split(':').map(Number);
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

export async function calculateFullBalance (employeeId: number, yearMonth: string, monthBalance: string){
    const lastMonth = getLastMonth(yearMonth);
    //pegar o saldo geral do mês anterior (hoursBankBalance)
    const lastMonthFullBalance = await getSummaryReportMonthRepository(employeeId, lastMonth);//obter saldo mês anterior
    // faço a conta do saldo do mês que enviei a data
    if (!lastMonthFullBalance || lastMonthFullBalance.hoursBankBalance === "0" || lastMonthFullBalance.hoursBankBalance === "00:00"){
        const monthFullBalance = monthBalance;
        return monthFullBalance;
    } else {
        const [hours, minutes] = monthBalance.split(':').map(Number);
        const formattedMinutes = Number(monthBalance.slice(0,1) + minutes);
        const [lastMonthBalanceHours, lastMonthBalanceMinutes] = lastMonthFullBalance.hoursBankBalance.split(':').map(Number);
        const formattedLastMonthMinutes = Number(lastMonthFullBalance.hoursBankBalance.slice(0,1) + lastMonthBalanceMinutes);

        const totalAmountInMinutes = (hours*60) + formattedMinutes + (lastMonthBalanceHours*60) + formattedLastMonthMinutes;
        const totalHours = (totalAmountInMinutes / 60).toFixed(2);
        const totalMinutes = totalAmountInMinutes % 60;
        const monthFullBalance =`${String(totalHours).slice(0,-3).padStart(2, '0')}:${String(totalMinutes).slice(1).padStart(2, '0')}`;
        return monthFullBalance;
    }
}