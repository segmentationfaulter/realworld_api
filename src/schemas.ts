import { z } from "zod";

export const User = z.object({
  username: z.string().min(4).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  bio: z.string().optional(),
  image: z.string().optional(),
});
