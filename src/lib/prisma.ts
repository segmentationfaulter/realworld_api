import { PrismaClient, Prisma } from "@prisma/client";

export const prisma = new PrismaClient();

export const userSelectWithoutPassword = {
  username: true,
  email: true,
  bio: true,
  image: true,
} satisfies Prisma.UserSelect;

export const userSelectWithPassword = {
  ...userSelectWithoutPassword,
  password: true,
} satisfies Prisma.UserSelect;
