import { conflictError } from "@/errors";
import { EmployeeReturn } from "@/protocols";
import { createUserRepository, getUsersByUsernameRepository } from "@/repositories";
import { User } from "@prisma/client";
import bcrypt from "bcrypt";

export async function createUserService(name: string, username: string, password: string): Promise<EmployeeReturn> {
    await validateUniqueUsername(username);
    console.log("2");
    const hashedPassword = await bcrypt.hash(password, 12);
    const data = {name, username, password: hashedPassword};
    const newUser = await createUserRepository(data)
    const newUserReturn: EmployeeReturn = {id: newUser.id, name: newUser.name, username: newUser.username};
    return newUserReturn;
}

async function validateUniqueUsername(username: string) {
    try {
        const user = await getUsersByUsernameRepository(username);

        if (user) {
            console.log('User found:', user);
        } else {
            console.log('User not found.');
        }
    } catch (error) {
        console.error('Error while getting user by username:', error);
    }
    // const usernameExists = await getUsersByUsernameRepository(username);
    // console.log("1");
    // if (usernameExists) {
    //     throw conflictError("this username already exists");
    // }
}