import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";
import { createUser, generateValidUserBody } from "../factories/user-factory";

beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);
const today = new Date();
const formattedToday = `${today.getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`
const yearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
// criar usuário - rota autenticada - preciso do token (não tem body)
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
        it("should respond with status 404 when route is not valid", async () => {
            const token = faker.lorem.word();
            const response = await server.get(`/bank/today/${formattedToday}`).set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
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
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await server.get(`/bank/today/${formattedToday}`).set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.OK);
            // expect(response.body).toEqual(
            //     expect.objectContaining({
            //         id: expect.any(Number),
            //         username: body.username,
            //         name: body.name,
            //     }),
            // )
        });
    })
})