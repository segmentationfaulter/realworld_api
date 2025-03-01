import "dotenv/config";
import express from "express";
import { expressjwt as jwt } from "express-jwt";
import {
  authRouter,
  userRouter,
  profilesRouter,
  articlesRouter,
} from "./routes/index.ts";
import { endpoint } from "./lib/util.ts";

const app = express();

app
  .use(express.json())
  .use(
    jwt({
      secret: process.env.JWT_SECRET as string,
      algorithms: ["HS256"],
      credentialsRequired: false,
    }),
  )
  .use(authRouter)
  .use(endpoint("user"), userRouter)
  .use(endpoint("profiles"), profilesRouter)
  .use(endpoint("articles"), articlesRouter)
  .listen(process.env.PORT, () => {
    console.info(`Server listening on port ${process.env.PORT}`);
  });
