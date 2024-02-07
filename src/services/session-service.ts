import { conflictError, invalidCredentialsError, unauthorizedError } from "../errors";
import { EmployeeLogin } from "../protocols";
import { sessionRepository } from "../repositories";

export async function sessionService(username: string, token: string) {
    const session = await sessionRepository(token);
    if(session?.User.username !== username){
        throw conflictError("This token does not match this username");
    }
    return session;
}
