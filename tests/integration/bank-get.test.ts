import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import { createUser } from "../factories/user-factory";
import { insertHour } from "../factories/bank-factory";
import { empty } from "@prisma/client/runtime/library";
import { date, number, string } from "joi";

beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);
const today = new Date();
const formattedToday = `${today.getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
// pegar informações do dia de hoje - rota autenticada - preciso do token (não tem body)
describe("GET /bank/today/:today", () => {
    describe("when token is  not valid", () => {
        it("should respond with status 401 if no token is given", async () => {
            const response = await server.get(`/bank/today/${formattedToday}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();
            const response = await server.get(`/bank/today/${formattedToday}`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
            const response = await server.get(`/bank/today/${formattedToday}`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })
    describe("when token is valid", () => {
        it("should respond with status 400 when token is valid but params is not given", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            
            const response = await server.get(`/bank/today/`).set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });
        it("should respond with status 400 when token is valid but params is not valid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const invalidParam = '22222-22'
            const response = await server.get(`/bank/today/${invalidParam}`).set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 200 when token and param are valid", async () => {
            // nesse caso não adicionei nenhuma hora ainda
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await server.get(`/bank/today/${formattedToday}`).set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                expect.objectContaining({
                    hourControls: null,
                    bankHours: null,
                    bankBalanceLastMonth: expect.objectContaining({
                        hoursBankBalance: "00:00"
                    }),
                }),
            )
        });
        it("should respond with status 200 and today posted hour when token and param are valid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await insertHour(formattedToday, "08:00:00", "entry_time", user.id);
            const response = await server.get(`/bank/today/${formattedToday}`).set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toStrictEqual(
                expect.objectContaining({
                    hourControls: expect.objectContaining({
                        "id": expect.any(Number),
                        "employeeId": user.id,
                        "day": `${formattedToday}T00:00:00.000Z`,
                        "entry_time": `${formattedToday}T08:00:00.000Z`,
                        "pause_time": null,
                        "return_time": null,
                        "exit_time": null,
                        "totalWorkedByDay": `${formattedToday}T00:00:00.000Z`,
                        "createdAt": expect.any(String),
                        "updatedAt": expect.any(String),
                    }),
                    bankHours: null,
                    bankBalanceLastMonth: expect.objectContaining({
                        hoursBankBalance: "00:00"
                    }),
                }),
            )
        });
    })
})
// pegar informações do mês desejado - rota autenticada - preciso do token (não tem body)
describe("GET /bank/month/:month", () => {
    describe("when token is  not valid", () => {
        it("should respond with status 401 if no token is given", async () => {
            const response = await server.get(`/bank/month/${yearMonth}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();
            const response = await server.get(`/bank/month/${yearMonth}`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
            const response = await server.get(`/bank/month/${yearMonth}`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })
    describe("when token is valid", () => {
        it("should respond with status 400 when token is valid but params is not given", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            
            const response = await server.get(`/bank/month/`).set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });
        it("should respond with status 400 when token is valid but params is not valid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const invalidParam = '22222-22'
            const response = await server.get(`/bank/month/${invalidParam}`).set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 200 when token and param are valid", async () => {
            // nesse caso não adicionei nenhuma hora ainda
            const user = await createUser();
            const newToken = await generateValidToken(user);
            const response = await server.get(`/bank/month/${yearMonth}`).set("Authorization", `Bearer ${newToken}`);
        
            expect(response.status).toBe(httpStatus.OK);
            console.log(response.body);
            expect(response.body).toEqual(
                {
                    bankBalanceLastMonth: {
                        hoursBankBalance: "00:00"
                    },
                    bankHours: null,
                    hourControls: [
                        {
                            "id": expect.any(Number),
                            "employeeId": expect.any(Number),
                            "day": expect.any(String),
                            "entry_time": expect.any(String),
                            "pause_time": null,
                            "return_time": null,
                            "exit_time": null,
                            "totalWorkedByDay": expect.any(String),
                            "createdAt": expect.any(String),
                            "updatedAt": expect.any(String),
                        }
                    ],                    
                },
            )
        });
    })
})