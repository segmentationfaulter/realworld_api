import express from "express";
import { prisma, profileSelect } from "../lib/prisma.ts";
import { allowRegisteredUsersOnly } from "../lib/util.ts";
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

    const profile = await prisma.user.findUnique({
      where: { username },
      select: {
        ...profileSelect,
        ...followerSelect,
      },
    });

    if (!profile) {
      res.sendStatus(404);
      return;
    }

    const { followers, ..._profile } = profile;
    const following = followers.length > 0;
    req.profile = { following, ..._profile };
    return next();
  })
  .get("/", async (req, res) => {
    if (!req.profile) return;

    res.json(req.profile);
  })
  .use(allowRegisteredUsersOnly)
  .route("/follow")
  .post(async (req, res, next) => {
    if (!req.profile) {
      return;
    }

    try {
      await prisma.userFollower.create({
        data: {
          userId: req.profile.id,
          followerId: req.auth?.id!,
        },
      });

      res.json({ ...req.profile, following: true });
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
  })
  .delete(async (req, res) => {
    if (!req.profile?.id || !req.auth?.id) {
      res.sendStatus(400);
      return;
    }

    await prisma.userFollower.delete({
      where: {
        userId_followerId: {
          userId: req.profile.id,
          followerId: req.auth.id,
        },
      },
    });

    res.json({ ...req.profile, following: false });
  });
