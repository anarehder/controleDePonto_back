export type NewUserInput = {
    name: string;
    username: string;
    password: string;
};

export type LoginParams = {
    username: string;
    password: string;
};

export type EmployeeReturn = {
    id: number;
    name: string;
    username: string;
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