import { PrismaClient, Prisma } from "@prisma/client";

export const prisma = new PrismaClient();

export const userSelect = {
  username: true,
  email: true,
  bio: true,
  image: true,
} satisfies Prisma.UserSelect;

export const profileSelect = {
  username: true,
  image: true,
  bio: true,
} satisfies Prisma.UserSelect;
