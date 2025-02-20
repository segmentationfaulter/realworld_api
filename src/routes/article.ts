import express from "express";
import Slugger from "github-slugger";
import { allowRegisteredUsersOnly } from "../lib/util";
import { articleSelect, prisma } from "../lib/prisma";
import { ArticleRequestBody } from "../schemas";
import { ZodError } from "zod";

export const articlesRouter = express.Router();
const slugger = new Slugger();

articlesRouter
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
