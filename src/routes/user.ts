import express from "express";
import { prisma } from "../lib/prisma";
import { toUserResponse } from "../lib/util";

export const userRouter = express.Router();

userRouter.route("/user").get(async (req, res, next) => {
  if (!req.auth?.id) {
    res.status(401);
  }

  const user = await prisma.user.findUnique({ where: { id: req.auth?.id } });
  if (!user) {
    res.sendStatus(404);
    return;
  }
  res.json(toUserResponse(user));
});
