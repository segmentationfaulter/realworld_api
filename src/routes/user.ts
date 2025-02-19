import express from "express";
import { expressjwt as jwt } from "express-jwt";
import { prisma } from "../lib/prisma";
import { toUserResponse } from "../lib/util";
import { RegisterationRequestBody } from "../schemas";
import { ZodError } from "zod";

export const userRouter = express.Router();

userRouter
  .use(jwt({ secret: process.env.JWT_SECRET as string, algorithms: ["HS256"] }))
  .route("/user")
  .get(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.auth?.id } });
    if (!user) {
      res.sendStatus(404);
      return;
    }
    res.json(toUserResponse(user));
  })
  .put(async (req, res, next) => {
    try {
      const reqBody = RegisterationRequestBody.partial().parse(req.body);
      const updatedUser = await prisma.user.update({
        where: { id: req.auth?.id },
        data: reqBody,
      });

      if (updatedUser) {
        res.status(201).json(toUserResponse(updatedUser));
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
