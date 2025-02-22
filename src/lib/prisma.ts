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

export const articleSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  body: true,
  tags: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: profileSelect,
  },
  favoritedBy: true,
  _count: {
    select: {
      favoritedBy: true,
    },
  },
} satisfies Prisma.ArticleSelect;
