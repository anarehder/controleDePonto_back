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
// criar usuário - rota autenticada - preciso do token (valida primeiro o token e depois o body)
describe("POST /users", () => {
    describe("when token is  not valid", () => {
        it("should respond with status 401 if no token is given", async () => {
            const response = await server.post("/users");

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();
            const response = await server.post("/users").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 404 when route is not valid", async () => {
            const token = faker.lorem.word();
            const response = await server.post("/test").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });
        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
            const response = await server.post("/users").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })
    describe("when token is valid", () => {
        it("should respond with status 400 when token is valid but body is not given", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await server.post("/users").set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });
        it("should respond with status 400 when token is valid but body is not valid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = { test: "" };
            const response = await server.post("/users").set("Authorization", `Bearer ${token}`).send(body);
        
            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });
        it("should respond with status 200 when token and body are valid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const body = generateValidUserBody();
            const response = await server.post("/users").set("Authorization", `Bearer ${token}`).send(body);
        
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    username: body.username,
                    name: body.name,
                }),
            )
        });
    })
})

// criar usuário - rota autenticada - preciso do token (não possui body)
describe("GET /users", () => {
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/users");

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
        const response = await server.get("/users").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    it("should respond with status 404 when route is not valid", async () => {
        const token = faker.lorem.word();
        const response = await server.get("/test").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
    });
    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
        const response = await server.get("/users").set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    describe("when token is valid", () => {
        it("should respond with status 200 when token is valid", async () => {
            const user = await createUser(); // para autenticação
            const token = await generateValidToken(user);

            const user1 = await createUser();
            const user2 = await createUser();
            const response = await server.get("/users").set("Authorization", `Bearer ${token}`);
        
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    username: user1.username,
                    name: user1.name,
                }),
                expect.objectContaining({
                    id: expect.any(Number),
                    username: user2.username,
                    name: user2.name,
                }),
                ])
            )
        });
    })
})