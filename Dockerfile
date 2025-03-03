# syntax=docker/dockerfile:1

ARG NODE_VERSION=23.6.1
FROM node:${NODE_VERSION}
ENV PORT=3000
ENV NODE_ENV=development
WORKDIR /app
RUN npm install -g ts-node
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE ${PORT}
CMD ["sh", "-c", "npx prisma migrate dev && npm run dev"]
