import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

type Endpoint = "login" | "register" | "user" | "profiles";

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

    default:
      const exhaustiveCheck: never = endpoint;
      return "";
  }
}

export function toUserResponse(user: User) {
  const { id, password, createdAt, updatedAt, ...userResponse } = user;
  return userResponse;
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
