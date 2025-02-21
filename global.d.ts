import { User } from "@prisma/client";
import { ProfileResult } from "./src/lib/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: ProfileResult | null;
      auth?: {
        id: number;
      };
      articleId?: number;
    }
  }
}

export {};
