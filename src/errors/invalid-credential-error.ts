import { ApplicationError } from "../protocols";

export function invalidCredentialsError(): ApplicationError {
  return {
    name: "invalidCredentialsError",
    message: "incorrect username or password",
  };
}
