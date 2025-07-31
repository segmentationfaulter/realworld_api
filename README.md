# RealWorld API

This is a backend API for a Medium.com clone, built with Node.js, Express, and Prisma. It adheres to the [RealWorld API specification](https://docs.realworld.build/specifications/backend/introduction/).

## Technologies

*   **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express**: A fast, unopinionated, minimalist web framework for Node.js.
*   **Prisma**: A next-generation ORM for Node.js and TypeScript.
*   **JSON Web Tokens (JWT)**: Used for authentication.
*   **Zod**: A TypeScript-first schema declaration and validation library.

## API Endpoints

The API exposes the following endpoints:

*   **Authentication**:
    *   `POST /api/users/login`: Login a user.
    *   `POST /api/users`: Register a new user.
*   **User**:
    *   `GET /api/user`: Get the current user.
    *   `PUT /api/user`: Update the current user.
*   **Profiles**:
    *   `GET /api/profiles/:username`: Get a user's profile.
    *   `POST /api/profiles/:username/follow`: Follow a user.
    *   `DELETE /api/profiles/:username/follow`: Unfollow a user.
*   **Articles**:
    *   `GET /api/articles`: Get recent articles globally.
    *   `GET /api/articles/feed`: Get recent articles from followed users.
    *   `GET /api/articles/:slug`: Get a single article.
    *   `POST /api/articles`: Create a new article.
    *   `PUT /api/articles/:slug`: Update an article.
    *   `DELETE /api/articles/:slug`: Delete an article.
    *   `POST /api/articles/:slug/comments`: Add a comment to an article.
    *   `GET /api/articles/:slug/comments`: Get comments for an article.
    *   `DELETE /api/articles/:slug/comments/:id`: Delete a comment.
    *   `POST /api/articles/:slug/favorite`: Favorite an article.
    *   `DELETE /api/articles/:slug/favorite`: Unfavorite an article.

## Getting Started

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/realworld-api.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up your environment variables in a `.env` file. You'll need a `JWT_SECRET` and a `DATABASE_URL`.
4.  Run the database migrations:
    ```bash
    npx prisma migrate dev
    ```
5.  Start the server:
    ```bash
    npm run dev
    ```

The server will be running on `http://localhost:3000`.

## Specification

This API is built to conform to the [RealWorld backend API specification](https://docs.realworld.build/specifications/backend/introduction/).
