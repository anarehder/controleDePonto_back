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

export type NewRegistry = {
    employeeId: number;
    date: Date;
    time: Date;
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