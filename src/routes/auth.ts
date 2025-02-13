import express from "express";

export const authRouter = express.Router();

authRouter.post("/register", (req, res) => {
  res.json(req.body);
});
