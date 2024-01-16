import { ApplicationError } from "../protocols";

export function CannotGetData(): ApplicationError {
  return {
    name: "CannotGetData",
    message: "Cannot get this data! Try later.",
  };
}
