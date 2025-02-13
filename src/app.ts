import "dotenv/config";
import express from "express";
import { authRouter } from "./routes/auth.ts";

const app = express();

app.use(express.json());
app.use(authRouter);

app.listen(process.env.PORT, () => {
  console.info(`Server listening on port ${process.env.PORT}`);
});
