import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

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
