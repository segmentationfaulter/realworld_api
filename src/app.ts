import "dotenv/config";
import express from "express";
import { expressjwt as jwt } from "express-jwt";
import { authRouter } from "./routes/auth.ts";

const app = express();

app.use(express.json());
app.use(authRouter);
app.use(
  jwt({ secret: process.env.JWT_SECRET as string, algorithms: ["HS256"] }),
);

app.listen(process.env.PORT, () => {
  console.info(`Server listening on port ${process.env.PORT}`);
});
