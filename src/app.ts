import "dotenv/config";
import express from "express";
import { authRouter, userRouter } from "./routes";

const app = express();

app.use(express.json());
app.use(authRouter);
app.use(userRouter);

app.listen(process.env.PORT, () => {
  console.info(`Server listening on port ${process.env.PORT}`);
});
