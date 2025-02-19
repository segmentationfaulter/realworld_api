import express from "express";
import { prisma, userSelectWithoutPassword } from "../lib/prisma";
import { allowRegisteredUsersOnly } from "../lib/util";
import { RegisterationRequestBody } from "../schemas";
import { ZodError } from "zod";

export const userRouter = express.Router();

userRouter
  .use(allowRegisteredUsersOnly)
  .route("/")
  .get(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.auth?.id },
      select: userSelectWithoutPassword,
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
        select: userSelectWithoutPassword,
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
