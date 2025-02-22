import express from "express";
import Slugger from "github-slugger";
import { allowRegisteredUsersOnly } from "../lib/util";
import { articleSelect, prisma } from "../lib/prisma";
import {
  ArticleQueryParams,
  ArticleRequestBody,
  ArticleUpdateBody,
} from "../schemas";
import { ZodError } from "zod";
import { isAuthenticated, isNotNullOrUndefined } from "../types";

export const articlesRouter = express.Router();
const slugger = new Slugger();

articlesRouter
  .get("/feed", allowRegisteredUsersOnly, async (req, res) => {
    if (!isAuthenticated(req)) {
      res.sendStatus(401);
      return;
    }

    const following = (
      await prisma.userFollower.findMany({
        where: {
          followerId: req.auth.id,
        },
      })
    ).map((record) => record.userId);

    const articles = await prisma.article.findMany({
      where: {
        authorId: {
          in: following,
        },
      },
      select: articleSelect,
    });

    res.json(articles);
  })
  .param("slug", async (req, res, next, slug) => {
    const article = await prisma.article.findUnique({
      where: {
        slug,
      },
      select: {
        ...articleSelect,
        favoritedBy: {
          where: {
            userId: req.auth?.id,
          },
        },
      },
    });

    if (article) {
      req.article = article;
    }
    next();
  })
  .get("/:slug", (req, res) => {
    if (!req.article) {
      res.sendStatus(404);
      return;
    }

    res.json(req.article);
  })
  .get("/", async (req, res) => {
    const {
      author: username,
      tags,
      favorited,
      offset,
      limit,
    } = ArticleQueryParams.partial().parse(req.query);
    let authorId: number | undefined;
    let favoritedByIds: number[] = [];
    const tagsList = tags?.split(",").map((tag) => tag.trim());
    const favoritedBy = favorited
      ?.split(",")
      .map((username) => username.trim());

    if (username) {
      authorId = (
        await prisma.user.findUnique({
          where: { username },
          select: { id: true },
        })
      )?.id;
    }

    if (favoritedBy?.length) {
      favoritedByIds = (
        await Promise.all(
          favoritedBy.map((username) => {
            return prisma.user.findUnique({
              where: { username },
              select: { id: true },
            });
          }),
        )
      )
        .map((user) => user?.id)
        .filter(isNotNullOrUndefined);
    }

    const articles = await prisma.article.findMany({
      select: articleSelect,
      where: {
        ...(authorId ? { authorId } : {}),
        ...(tagsList?.length
          ? {
              tags: {
                some: {
                  name: {
                    in: tagsList,
                  },
                },
              },
            }
          : {}),
        ...(favoritedByIds.length
          ? {
              favoritedBy: {
                some: {
                  userId: {
                    in: favoritedByIds,
                  },
                },
              },
            }
          : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset ?? 0,
      take: limit ?? 20,
    });

    res.json(articles);
  })
  .use(allowRegisteredUsersOnly)
  .put("/:slug", async (req, res, next) => {
    try {
      if (!req.article) {
        res.sendStatus(404);
        return;
      }
      if (!isAuthenticated(req) || req.article.author.id !== req.auth.id) {
        res.sendStatus(401);
        return;
      }

      const reqBody = ArticleUpdateBody.parse(req.body);
      if (reqBody.title) {
        reqBody.slug = slugger.slug(reqBody.title);
      }

      if (Object.keys(reqBody).length === 0) {
        res.sendStatus(400);
        return;
      }

      const updatedArticle = await prisma.article.update({
        where: { id: req.article.id },
        select: articleSelect,
        data: reqBody,
      });

      res.json(updatedArticle);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json(error.issues);
      }
      next(error);
    }
  })
  .post("/", async (req, res, next) => {
    try {
      const reqBody = ArticleRequestBody.parse(req.body);
      const { tagList, ..._reqBody } = reqBody;

      const article = await prisma.$transaction(async (tx) => {
        const tags = tagList
          ? await Promise.all(
              tagList.map((name) => {
                return tx.tag.upsert({
                  where: { name },
                  create: { name },
                  update: {},
                });
              }),
            )
          : [];

        return tx.article.create({
          data: {
            ..._reqBody,
            slug: slugger.slug(reqBody.title),
            authorId: req.auth?.id!,
            tags: {
              connect: tags.map((tag) => ({ id: tag.id })),
            },
          },
          select: articleSelect,
        });
      });

      res.status(201).json(article);
    } catch (error) {
      if (error instanceof ZodError) {
        res.json(error.issues);
      }
      next(error);
    }
  })
  .post("/:slug/favorite", async (req, res) => {
    if (!isAuthenticated(req) || !req.article?.id) {
      res.sendStatus(400);
      return;
    }

    await prisma.favorite.create({
      data: {
        articleId: req.article.id,
        userId: req.auth.id,
      },
    });

    res.sendStatus(201);
  })
  .delete("/:slug/favorite", async (req, res) => {
    if (
      !isAuthenticated(req) ||
      !req.article?.id ||
      !req.article.favoritedBy.map((item) => item.userId).includes(req.auth.id)
    ) {
      res.sendStatus(400);
      return;
    }

    await prisma.favorite.delete({
      where: {
        userId_articleId: {
          userId: req.auth.id,
          articleId: req.article.id,
        },
      },
    });

    res.sendStatus(204);
  });
