import express from "express";
import Slugger from "github-slugger";
import { allowRegisteredUsersOnly } from "../lib/util";
import { articleSelect, prisma } from "../lib/prisma";
import { ArticleQueryParams, ArticleRequestBody } from "../schemas";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export const articlesRouter = express.Router();
const slugger = new Slugger();

articlesRouter
  .get("/", async (req, res) => {
    const { author: username } = ArticleQueryParams.partial().parse(req.query);
    let authorId: number | undefined;

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
      where: { authorId },
      orderBy: {
        createdAt: "desc",
      },
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
  });
