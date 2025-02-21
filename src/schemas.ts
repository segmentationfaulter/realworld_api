import { z } from "zod";

export const RegisterationRequestBody = z.object({
  username: z.string().min(4).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  bio: z.string().optional(),
  image: z.string().optional(),
});

export const LoginCredentials = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const ArticleRequestBody = z.object({
  title: z.string().nonempty(),
  description: z.string().nonempty(),
  body: z.string().nonempty(),
  tagList: z.array(z.string()).optional(),
});

export const ArticleQueryParams = z.object({
  tags: z.string(),
  author: z.string(),
  favorited: z.string(),
});
