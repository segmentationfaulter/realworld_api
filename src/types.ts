import { Prisma } from "@prisma/client";
import { type Request } from "express";
import { articleSelect, profileSelect } from "./lib/prisma";
export type Endpoint = "login" | "register" | "user" | "profiles" | "articles";

interface Authenticated extends Request {
  auth: {
    id: number;
  };
}

export function isAuthenticated(req: Request): req is Authenticated {
  return !!req.auth?.id;
}

export function isNotNullOrUndefined<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}

export type ProfileResult = Prisma.UserGetPayload<{
  select: typeof profileSelect;
}> & { following: boolean };

export type ArticleResult = Prisma.ArticleGetPayload<{
  select: typeof articleSelect;
}>;
