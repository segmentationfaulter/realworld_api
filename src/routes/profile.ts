import express from "express";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const profilesRouter = express.Router({ mergeParams: true });

const profileSelect: Prisma.UserSelect = {
  username: true,
  bio: true,
  image: true,
};

profilesRouter
  .use((req, res, next) => {
    const username = req.params?.username;

    if (!username) {
      res.status(400).send("username parameter must be specified");
    }
    req.username = username;
    return next();
  })
  .route("/")
  .get(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { username: req.username },
      select: {
        ...profileSelect,
        followers: {
          where: {
            followerId: req.auth?.id,
          },
        },
      },
    });

    if (!user) {
      res.sendStatus(404);
      return;
    }

    const following = user?.followers.length;
    const { followers, ..._user } = user;

    res.json({ ..._user, following: !!following });
  });
