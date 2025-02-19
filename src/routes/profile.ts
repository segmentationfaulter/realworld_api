import express from "express";
import { prisma, profileSelect } from "../lib/prisma";
import { allowRegisteredUsersOnly } from "../lib/util";

export const profilesRouter = express.Router({ mergeParams: true });

profilesRouter
  .use((req, res, next) => {
    const username = req.params?.username;

    if (!username) {
      res.status(400).send("username parameter must be specified");
    }
    req.username = username;
    return next();
  })
  .get("/", async (req, res) => {
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

    const following = user?.followers.length > 0;
    const { followers, ..._user } = user;

    res.json({ ..._user, following: !!following });
  })
  .use(allowRegisteredUsersOnly)
  .route("/follow")
  .post(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { username: req.username },
      select: { ...profileSelect, id: true },
    });

    if (!user) {
      res.sendStatus(404);
      return;
    }

    await prisma.userFollower.create({
      data: {
        userId: user.id,
        followerId: req.auth?.id!,
      },
    });

    const { id, ...userMinusId } = user;

    res.json({ ...userMinusId, following: true });
  });
