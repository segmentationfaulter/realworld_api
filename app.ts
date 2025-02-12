import "dotenv/config";
import express from "express";

const app = express();

app.get("/api", (req, res, next) => {});

app.listen(process.env.PORT, () => {
  console.info(`Server listening on port ${process.env.PORT}`);
});
