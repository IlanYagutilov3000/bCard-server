BCard API

Usage

Bcard API is a backend service for managing business cards and users. It provides endpoints for creating, retrieving, updating, and deleting business cards and user accounts. 
This API is designed to work with the Bcard frontend application.

Resources

When the database is empty, the API will seed the following initial data on the first run:

Users:

1. Regular user
2. Business user
3. Admin user

Business Cards:

Three sample business cards will also be seeded.

Routes
All the routes in the project.

Business Cards: 

GET /cards
GET /cards/my-cards
GET /cards/:id
POST /cards
PUT /cards/:id
PATCH /cards/:id
PATCH /cards/bizz-number/:id
DELETE /cards/:id

Users:

POST /users
POST /users/login
GET /users
GET /users/:id
PUT /users/:id
PATCH /users/:id
DELETE /users/:id

Middleware & Security
Authentication: JWT-based authentication for secure access.
Logging: Errors with status codes 400+ are logged using Morgan.

I added Account Lockout: Users are locked out after 3 failed login attempts as well.

Installation

1. Clone the repository:
2. Install dependencies: use npm install
3. If I send you the project .env was send as well I didn't send you the project please create a .env file.
4. Start the server: nodemon index

License
Copyright (c) 2025 Ilan Yagutilov.
