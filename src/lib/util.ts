import { User } from "@prisma/client";

export function toUserResponse(user: User) {
  const { id, password, createdAt, updatedAt, ...userResponse } = user;
  return userResponse;
}
