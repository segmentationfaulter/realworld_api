import express from "express";
import { prisma, userSelect } from "../lib/prisma.ts";
import { allowRegisteredUsersOnly } from "../lib/util.ts";
import { RegisterationRequestBody } from "../schemas.ts";
import { ZodError } from "zod";

export const userRouter = express.Router();

userRouter
  .use(allowRegisteredUsersOnly)
  .route("/")
  .get(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth?.id },
      select: userSelect,
    });
    if (!user) {
      res.sendStatus(404);
      return;
    }
    res.json(user);
  })
  .put(async (req, res, next) => {
    try {
      const reqBody = RegisterationRequestBody.partial().parse(req.body);
      const updatedUser = await prisma.user.update({
        where: { id: req.auth?.id },
        data: reqBody,
        select: userSelect,
      });

      if (updatedUser) {
        res.status(201).json(updatedUser);
      } else {
        res.sendStatus(400);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(error.issues);
      }
      next(error);
    }
  });
