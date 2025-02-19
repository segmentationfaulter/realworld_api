declare global {
  namespace Express {
    interface Request {
      username?: string;
      auth?: {
        id: number;
      };
    }
  }
}

export {};
