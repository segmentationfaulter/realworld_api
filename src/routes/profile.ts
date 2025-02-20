import express from "express";
import { prisma, profileSelect } from "../lib/prisma";
import { allowRegisteredUsersOnly } from "../lib/util";
import { Prisma } from "@prisma/client";

export const profilesRouter = express.Router({ mergeParams: true });

profilesRouter
  .use(async (req, res, next) => {
    const username = req.params?.username;

    if (!username) {
      res.status(400).send("username parameter must be specified");
    }

    const followerSelect = req.auth?.id
      ? { followers: { where: { followerId: req.auth.id } } }
      : null;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        ...profileSelect,
        ...followerSelect,
      },
    });

    if (!user) {
      res.sendStatus(404);
    }
    req.user = user;
    return next();
  })
  .get("/", async (req, res) => {
    if (!req.user) return;
    const following = req.user?.followers?.length;
    const { followers, id, ..._user } = req.user;

    res.json({ ..._user, following: !!following });
  })
  .use(allowRegisteredUsersOnly)
  .route("/follow")
  .post(async (req, res, next) => {
    if (!req.user) {
      return;
    }

    try {
      await prisma.userFollower.create({
        data: {
          userId: req.user.id,
          followerId: req.auth?.id!,
        },
      });

      const { id, followers, ..._user } = req.user;

      res.json({ ..._user, following: true });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          res
            .status(400)
            .json({ error: "You are already following this profile" });
        }
      }
      next(err);
    }
  });
