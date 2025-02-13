import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma.ts";
import { LoginCredentials, User } from "../schemas.ts";
import { ZodError } from "zod";
import { SALT_ROUNDS } from "../config/constants.ts";

export const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  try {
    const user = User.parse(req.body);
    const hash = await bcrypt.hash(user.password, SALT_ROUNDS);
    await prisma.user.create({ data: { ...user, password: hash } });
    res.sendStatus(201);
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
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const credentials = LoginCredentials.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: credentials.email },
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

    const { password, ...rest } = user;

    jwt.sign(rest, process.env.JWT_SECRET as string, {}, (err, token) => {
      if (err) {
        res.status(500).send("couldn't generate a token");
      }
      res.json({ token });
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(401).json({ error: "invalid credentials" });
    }
    next(error);
  }
});
