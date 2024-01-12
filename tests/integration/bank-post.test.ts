import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import { createUser } from "../factories/user-factory";
import { generateValidBankBody } from "../factories/bank-factory";

beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);
// const today = new Date();
// const formattedToday = `${today.getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
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
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
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
        // it("should respond with status 200 when token and body are valid", async () => {
        //     // nesse caso adicionei apenas o horario de entrada como 08:00
        //     const user = await createUser();
        //     const token = await generateValidToken(user);
        //     const body = generateValidBankBody();
        //     const response = await server.post("/bank").set("Authorization", `Bearer ${token}`).send(body);

        //     expect(response.status).toBe(httpStatus.OK);
        //     expect(response.body).toEqual(
        //         expect.objectContaining({
        //             hourControls: expect.objectContaining({
        //                 id: expect.any(Number),
        //                 employeeId: user.id,
        //                 day: `${body.day}T00:00:00.000Z`,
        //                 entry_time: `${body.day}T${body.time}.000Z`,
        //                 pause_time: null,
        //                 return_time: null,
        //                 exit_time: null,
        //                 totalWorkedByDay: `${body.day}T00:00:00.000Z`,
        //             }),
        //         }),
        //     )
        // });
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
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
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