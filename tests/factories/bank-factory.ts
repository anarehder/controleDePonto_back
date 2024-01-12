import { prisma } from "@/config";
import { NewRegistryInput } from "@/protocols";
import { HourControl } from "@prisma/client";

export function generateValidBankBody(params: Partial<NewRegistryInput> = {}){
    const day = params.day || "2024-01-12";
    const time = params.time || "08:00:00";
    const type =  params.type || "entry_time";
    return {day, time, type};
}

export async function insertHour(day: string, time: string, type: string, employeeId: number): Promise<HourControl> {

    const data = {employeeId, day: new Date(day), [type]: new Date(`${day}T${time}Z`), totalWorkedByDay: new Date(`${day}T00:00:00Z`)};

    return await prisma.hourControl.create({
        data
    });
}