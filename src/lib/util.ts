import type { NextFunction, Request, Response } from "express";
import { type Endpoint } from "../types.ts";

export function endpoint(endpoint: Endpoint) {
  const api = "/api";
  switch (endpoint) {
    case "login":
      return `${api}/login`;

    case "register":
      return `${api}/register`;

    case "user":
      return `${api}/user`;

    case "profiles":
      return `${api}/profiles/:username`;

    case "articles":
      return `${api}/articles`;

    default:
      const exhaustiveCheck: never = endpoint;
      return "";
  }
}

export const allowRegisteredUsersOnly = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.auth?.id) {
    return next();
  }
  res.sendStatus(401);
};
