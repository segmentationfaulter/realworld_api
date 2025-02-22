import { ArticleResult, ProfileResult } from "./src/types";

declare global {
  namespace Express {
    interface Request {
      profile?: ProfileResult | null;
      auth?: {
        id: number;
      };
      article?: ArticleResult | null;
    }
  }
}
