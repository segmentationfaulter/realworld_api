import express, { Request } from "express";
import Slugger from "github-slugger";
import { allowRegisteredUsersOnly } from "../lib/util";
import { articleSelect, prisma } from "../lib/prisma";
import { ArticleQueryParams, ArticleRequestBody } from "../schemas";
import { ZodError } from "zod";
import { hasArticleIdLoaded, isAuthenticated } from "../types";

export const articlesRouter = express.Router();
const slugger = new Slugger();

articlesRouter
  .param("slug", async (req, res, next, slug) => {
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (article) {
      req.articleId = article.id;
    }
    next();
  })
  .get("/", async (req, res) => {
    const {
      author: username,
      tags,
      offset,
      limit,
    } = ArticleQueryParams.partial().parse(req.query);
    let authorId: number | undefined;
    const tagsList = tags?.split(",");

    if (username) {
      authorId = (
        await prisma.user.findUnique({
          where: { username },
          select: { id: true },
        })
      )?.id;
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
    if (!isAuthenticated(req) || !hasArticleIdLoaded(req)) {
      res.sendStatus(400);
      return;
    }

    await prisma.favorite.create({
      data: {
        articleId: req.articleId,
        userId: req.auth.id,
      },
    });

    res.sendStatus(201);
  })
  .delete("/:slug/favorite", async (req, res) => {
    if (!isAuthenticated(req) || !hasArticleIdLoaded(req)) {
      res.sendStatus(400);
      return;
    }

    await prisma.favorite.delete({
      where: {
        userId_articleId: {
          userId: req.auth.id,
          articleId: req.articleId,
        },
      },
    });

    res.sendStatus(204);
  });
