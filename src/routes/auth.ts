import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma, User } from "@prisma/client";

import { prisma, userSelect } from "../lib/prisma.ts";
import { LoginCredentials, RegisterationRequestBody } from "../schemas.ts";
import { ZodError } from "zod";
import { SALT_ROUNDS } from "../config/constants.ts";
import { endpoint } from "../lib/util.ts";

export const authRouter = express.Router();

authRouter.post(endpoint("register"), async (req, res, next) => {
  try {
    const reqBody = RegisterationRequestBody.parse(req.body);
    const hash = await bcrypt.hash(reqBody.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: { ...reqBody, password: hash },
      select: { id: true, ...userSelect },
    });
    jwt.sign(user, process.env.JWT_SECRET as string, {}, (err, token) => {
      if (err) {
        res.status(500).send("Registeration done, token couldn't be generated");
      }
      res.status(201).json({ token, ...user });
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json(error.issues);
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        res
          .status(400)
          .json({ error: "User with this email/username already exists" });
      }
    }
    next(error);
  }
});

authRouter.post(endpoint("login"), async (req, res, next) => {
  try {
    const credentials = LoginCredentials.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
      select: { password: true, id: true, ...userSelect },
    });

    if (!user) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }

    const match = await bcrypt.compare(credentials.password, user.password);

    if (!match) {
      res.status(401).json({ error: "invalid credentials" });
      return;
    }

    const { password, ...userMinusPassword } = user;

    jwt.sign(
      userMinusPassword,
      process.env.JWT_SECRET as string,
      {},
      (err, token) => {
        if (err) {
          res.status(500).send("couldn't generate a token");
        }
        res.json({ token, ...userMinusPassword });
      },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(401).json({ error: "invalid credentials" });
    }
    next(error);
  }
});
