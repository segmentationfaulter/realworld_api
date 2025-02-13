import express from "express";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { User } from "../schemas";
import { ZodError } from "zod";
import { SALT_ROUNDS } from "../config/constants";

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
