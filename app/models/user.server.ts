import {
  getUserById as dbGetUserById,
  getUserByEmail as dbGetUserByEmail,
  createUser as dbCreateUser,
  deleteUserByEmail as dbDeleteUserByEmail,
  verifyLogin as dbVerifyLogin,
} from "~/db.server";

export type User = {
  id: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function getUserById(id: User["id"]) {
  return dbGetUserById(id);
}

export async function getUserByEmail(email: User["email"]) {
  return dbGetUserByEmail(email);
}

export async function createUser(email: User["email"], password: string) {
  return dbCreateUser(email, password);
}

export async function deleteUserByEmail(email: User["email"]) {
  return dbDeleteUserByEmail(email);
}

export async function verifyLogin(
  email: User["email"],
  password: User["password"],
) {
  if (!email || !password) {
    return null;
  }

  return dbVerifyLogin(email, password);
}
