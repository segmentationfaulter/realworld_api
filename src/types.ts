import { type Request } from "express";
export type Endpoint = "login" | "register" | "user" | "profiles" | "articles";

interface Authenticated extends Request {
  auth: {
    id: number;
  };
}

interface ArticleIdLoaded extends Request {
  articleId: number;
}

export function isAuthenticated(req: Request): req is Authenticated {
  return !!req.auth?.id;
}

export function hasArticleIdLoaded(req: Request): req is ArticleIdLoaded {
  return !!req.articleId;
}

export function isNotNullOrUndefined<T>(val: T | null | undefined): val is T {
  return val !== null && val !== undefined;
}
