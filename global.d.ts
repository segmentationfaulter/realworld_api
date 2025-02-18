declare global {
  namespace Express {
    interface Request {
      auth?: {
        id: number;
      };
    }
  }
}

export {};
