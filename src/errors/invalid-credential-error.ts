import { ApplicationError } from "@/protocols";

export function invalidCredentialsError(): ApplicationError {
  return {
    name: "InvalidCredentialsError",
    message: "incorrect username or password",
  };
}
