import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import { createUser } from "../factories/user-factory";
import { generateValidBankBody, insertHour, updateHour } from "../factories/bank-factory";

beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);
const today = new Date();
const formattedToday = `${today.getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
// const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
// enviar um horário de ponto - rota autenticada - preciso do token (primeiro avaliar o token depois o body)
describe("POST /bank", () => {
    describe("when token is  not valid", () => {
        it("should respond with status 401 if no token is given", async () => {
            const response = await server.post(`/bank`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();
            const response = await server.post(`/bank`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ employeeId: userWithoutSession.id }, process.env.JWT_SECRET);
            const response = await server.post(`/bank`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })
    describe("when token is valid", () => {
        it("should respond with status 400 when token is valid but body is not given", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            
            const response = await server.post(`/bank`).set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });
        it("should respond with status 400 when token is valid but body is not valid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = { test: "" };
            const response = await server.post(`/bank`).set("Authorization", `Bearer ${token}`).send(body);
        
            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });
        it("should respond with status 200 when token and body are valid", async () => {
            // nesse caso adicionei apenas o horario de entrada como 08:00
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = {day: "2024-01-01", time: "08:00", type:"entry_time"};
            const response = await server.post("/bank").set("Authorization", `Bearer ${token}`).send(body);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                expect.objectContaining({
                    createdAt: expect.any(String),
                    id: expect.any(Number),
                    employeeId: user.id,
                    day: `${body.day}T00:00:00.000Z`,
                    entry_time: `${body.day}T${body.time}:00.000Z`,
                    exit_time: null,
                    totalWorkedByDay: `${body.day}T00:00:00.000Z`,
                    updatedAt: expect.any(String),
                }),
            )
        });
        it("should respond with status 200 and full response when token and body are valid and a complete registry is done", async () => {
            // nesse caso adicionei apenas o horario de entrada como 08:00
            const user = await createUser();
            const token = await generateValidToken(user);
            const body1 = {day: "2024-01-01", time: "08:00", type:"entry_time"};
            await server.post("/bank").set("Authorization", `Bearer ${token}`).send(body1);
            const body2 = {day: "2024-01-01", time: "16:00", type:"exit_time"};
            const response = await server.post("/bank").set("Authorization", `Bearer ${token}`).send(body2);
            
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                expect.objectContaining({
                    workedTodayAmount: expect.objectContaining({
                        "id": expect.any(Number),
                        "employeeId": user.id,
                        "day": "2024-01-01T00:00:00.000Z",
                        "entry_time": "2024-01-01T08:00:00.000Z",
                        "exit_time": "2024-01-01T16:00:00.000Z",
                        "totalWorkedByDay": "2024-01-01T08:00:00.000Z",
                        "createdAt": expect.any(String),
                        "updatedAt": expect.any(String),
                    }),
                    bankHours: expect.objectContaining({
                        "id": expect.any(Number),
                        "employeeId": user.id,
                        "month": "2024-01",
                        "workedHoursByMonth": "08:00",
                        "totalHoursByMonth": "-168:00",
                        "hoursBankBalance": "-168:00",
                        "createdAt": expect.any(String),
                        "updatedAt": expect.any(String),
                    })
                })
            )
        });
    })
})

describe("POST /userreport", () => {
    describe("when token is  not valid", () => {
        it("should respond with status 401 if no token is given", async () => {
            const response = await server.post(`/bank/userreport`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();
            const response = await server.post(`/bank/userreport`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ employeeId: userWithoutSession.id }, process.env.JWT_SECRET);
            const response = await server.post(`/bank/userreport`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })
    describe("when token is valid", () => {
        it("should respond with status 400 when token is valid but body is not given", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            
            const response = await server.post(`/bank/userreport`).set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });
        it("should respond with status 400 when token is valid but body is not valid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = { test: "" };
            const response = await server.post(`/bank/userreport`).set("Authorization", `Bearer ${token}`).send(body);
        
            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });
        it("should respond with status 200 when token and body are valid", async () => {
            // nesse caso adicionei apenas o horario de entrada como 08:00
            const user = await createUser();
            const token = await generateValidToken(user);
            const employee = await createUser();
            const yearMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
            const body = {employeeId: employee.id, month: yearMonth};
            const response = await server.post("/bank/userreport").set("Authorization", `Bearer ${token}`).send(body);
            // esse resultado porque não inseri nada no banco de horas para esse employee
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                expect.objectContaining({
                    hourControls: [],
                    bankHours: null,
                    bankBalanceLastMonth: {
                        hoursBankBalance: "00:00"
                    }
                })
            );
        });
    })
})