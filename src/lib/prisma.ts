import { PrismaClient, Prisma } from "@prisma/client";

export const prisma = new PrismaClient();

export const userSelect = {
  username: true,
  email: true,
  bio: true,
  image: true,
} satisfies Prisma.UserSelect;

export const profileSelect = {
  id: true,
  username: true,
  image: true,
  bio: true,
} satisfies Prisma.UserSelect;

export type ProfileResult = Prisma.UserGetPayload<{
  select: typeof profileSelect & {
    followers: {
      where: {
        followerId: number | undefined;
      };
    };
  };
}>;
