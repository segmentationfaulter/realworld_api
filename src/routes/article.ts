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
      const article = await prisma.article.create({
        data: {
          ...reqBody,
          slug: slugger.slug(reqBody.title),
          authorId: req.auth?.id!,
        },
        select: articleSelect,
      });

      res.json(article);
    } catch (error) {
      if (error instanceof ZodError) {
        res.json(error.issues);
      }
      next(error);
    }
  });
