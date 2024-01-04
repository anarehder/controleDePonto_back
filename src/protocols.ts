export type newUser = {
    name: string;
    username: string;
    password: string;
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