import express from "express";
import { prisma, profileSelect } from "../lib/prisma";
import { allowRegisteredUsersOnly } from "../lib/util";

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
  .post(async (req, res) => {
    if (!req.user) {
      return;
    }

    await prisma.userFollower.create({
      data: {
        userId: req.user.id,
        followerId: req.auth?.id!,
      },
    });

    const { id, followers, ..._user } = req.user;

    res.json({ ..._user, following: true });
  });
