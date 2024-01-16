import { ApplicationError } from "../protocols";

export function invalidParamError(message: string): ApplicationError {
  return {
    name: "InvalidParamError",
    message,
  };
}
