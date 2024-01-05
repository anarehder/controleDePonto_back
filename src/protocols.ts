import { HourControl, BankHours } from "@prisma/client";

export type NewUserInput = {
    name: string;
    username: string;
    password: string;
};

export type LoginParams = Omit<NewUserInput, 'name'>;

export type EmployeeLogin = {
    id: number;
    name: string;
    username: string;
    token: string;
};

export type EmployeeReturn = Omit<EmployeeLogin, 'token'>;

export type SessionInput = {
    employeeId: number;
    token: string;
};

export type NewRegistryInput = {
    day: Date;
    type: string;
    time: Date;
}

export type NewRegistry = {
    employeeId: number;
    day: Date;
    entry_time?: Date;
    pause_time?: Date;
    return_time?: Date;
    exit_time?: Date;
    totalWorkedByDay: Date;
}

export type UpdateRegistry = {
    employeeId: number;
    day: Date;
    entry_time?: Date;
    pause_time?: Date;
    return_time?: Date;
    exit_time?: Date;
}


export type SummaryReport = {
    hourControls: HourControl | null;
    bankHours: BankHours | null;
    bankBalanceLastMonth: {hoursBankBalance: Date} | null;
}

export type LastMonthBalance = {
    hoursBankBalance: Date | null;
}

export type ApplicationError = {
    name: string;
    message: string;
};

export type RequestError = {
    status: number,
    data: object | null,
    statusText: string,
    name: string,
    message: string,
};