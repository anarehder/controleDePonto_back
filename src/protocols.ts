import { HourControl, BankHours } from "@prisma/client";

export type NewUserInput = {
    name: string;
    username: string;
    password: string;
};

export type LoginParams = Omit<NewUserInput, 'name'>;

export type SessionParams = {
    username: string;
    token: string;
};

export type EmployeeLogin = {
    id: number;
    name: string;
    username: string;
    token: string;
};

export type EmployeeReturn = Omit<EmployeeLogin, 'token'>;

export type FullReport = {
    id: number;
    name: string;
    username: string;
    report: SummaryReport
}

export type SessionInput = {
    employeeId: number;
    token: string;
};

export type GetUserReportInput = {
    month: string;
    employeeId: number;
}

export type NewRegistryInput = {
    day: Date;
    type: string;
    time: Date;
}

export type NewRegistry = {
    employeeId: number;
    day: Date;
    entry_time: Date;
    exit_time?: Date;
    totalWorkedByDay: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export type UpdateRegistry = {
    employeeId: number;
    day: Date;
    entry_time?: Date;
    exit_time?: Date;
}

export type SummaryReport = {
    hourControls: HourControl[] | null;
    bankHours: BankHours | null;
    bankBalanceLastMonth: {hoursBankBalance: String} | null;
}

export type MonthBalance = {
    hoursBankBalance: String | null;
}

export type MonthTotalHours = {
    totalHoursByMonth: string | null;
}

export type TotalWorkedHoursByMonth = {
    totalWorkedSeconds: number;
    employeeId: number;
}

export type NewBankHoursRegistry = {
    employeeId: number;
    month: string;
    workedHoursByMonth: string;
    totalHoursByMonth: string;
    hoursBankBalance: string;
}

export type UpdateBankHoursRegistry = {
    workedHoursByMonth?: string;
    totalHoursByMonth?: string;
    hoursBankBalance?: string;
}

export type PostHoursCompleteReturn = {
    workedTodayAmount: HourControl;
    bankHours: BankHours;
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