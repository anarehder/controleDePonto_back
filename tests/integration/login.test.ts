import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import { createUser } from "../factories/user-factory";
import faker from "@faker-js/faker";
import * as jwt from "jsonwebtoken";

beforeAll(async () => {
    await init();
    await cleanDb();
});

const server = supertest(app);

// fazer login - rota não autenticada - preciso do body
describe("POST /login", () => {
    describe("when body is  not valid", () => {
        it("should respond with status 401 if no body is given", async () => {
            const response = await server.post("/login");

            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });
        it("should respond with status 401 if given body is not valid", async () => {
            const body = {teste: ""};
            const response = await server.post("/login").send(body);

            expect(response.status).toBe(httpStatus.BAD_REQUEST);
        });
    })
    describe("when body is valid", () => {
        it("should respond with status 400 when body is valid but password is incorrect", async () => {
            const user = await createUser();
            const body = { username: user.username, password: faker.internet.password(6)};
            const response = await server.post("/login").send(body);
        
            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 400 when body is valid but username is incorrect", async () => {
            const password = "senha123";
            const user = await createUser({password});
            const body = { username: faker.internet.userName(), password};
            const response = await server.post("/login").send(body);
        
            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 200 when body is valid and username/password are correct", async () => {
            const password = "senha123";
            const user = await createUser({password}); //aqui ela volta com hash
            const body = { username: user.username, password};
            const response = await server.post("/login").send(body);
        
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    username: user.username,
                    name: user.name,
                    token: expect.any(String),
                }),
            )
        });
    })
})

// fazer logout - rota autenticada - preciso do token
describe("DELETE /login/logout", () => {
    describe("when token is  not valid", () => {
        it("should respond with status 401 if no token is given", async () => {
            const response = await server.delete("/login/logout");

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if given token is not valid", async () => {
            const token = faker.lorem.word();
            const response = await server.delete("/login/logout").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
        it("should respond with status 401 if there is no session for given token", async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
            const response = await server.delete("/login/logout").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })
    describe("when token is valid", () => {
        it("should respond with status 200 when token is valid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await server.delete("/login/logout").set("Authorization", `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.OK);
        });
    })
})