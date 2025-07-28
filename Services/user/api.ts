import { api, APIError } from "encore.dev/api";
import { prismaClient, Prisma } from "../../prisma/client";

interface CreateUserRequest {
  email: string;
  name: string;
}

export const createUser = api(
  { method: "POST", path: "/users", expose: true },
  async (req: CreateUserRequest) => {
    try {
      const user = await prismaClient.user.create({
        data: req,
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          throw APIError.alreadyExists("User with this email already exists");
        }
      }
      throw error;
    }
  },
);

export const getUsers = api(
  { method: "GET", path: "/users", expose: true },
  async (): Promise<{
    users: { name: string; email: string; id: number }[];
  }> => {
    return { users: await prismaClient.user.findMany() };
  },
);
