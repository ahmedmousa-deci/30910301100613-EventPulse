# Event Paluse API

A production-ready RESTful API for event management with real-time announcements, built with Node.js, Express, MongoDB, and Socket.io.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Real-Time Announcements](#real-time-announcements)
- [Authentication](#authentication)
- [Validation & Error Handling](#validation--error-handling)
- [API Documentation](#api-documentation)
- [Testing](#testing)

---

## Features

- **JWT Authentication** — Secure login and registration with role-based access control
- **Role-Based Access** — Admin and Attendee roles with scoped permissions
- **Event Management** — Full CRUD for events with filtering, pagination, and search
- **Category Management** — Organize events by category
- **Registration System** — Attendees can register for events
- **Real-Time Announcements** — Admins broadcast live messages to event attendees via Socket.io
- **Input Validation** — All endpoints validated with `express-validator`, returning structured 422 errors
- **Centralized Error Handling** — Consistent error responses across all routes
- **Interactive API Docs** — Swagger UI available at `/api-docs`
- **Automated Tests** — Unit and integration tests with Jest and Supertest

---

## Tech Stack

| Layer            | Technology                         |
| ---------------- | ---------------------------------- |
| Runtime          | Node.js                            |
| Framework        | Express.js v5                      |
| Database         | MongoDB + Mongoose                 |
| Real-Time        | Socket.io                          |
| Authentication   | JSON Web Tokens (JWT)              |
| Password Hashing | bcrypt                             |
| Validation       | express-validator                  |
| API Docs         | swagger-jsdoc + swagger-ui-express |
| Testing          | Jest + Supertest                   |
| Logging          | Morgan                             |

---

## Project Structure

```
event_paluse/
├── config/
│   ├── config.js          # Environment variable loader
│   └── swagger.js         # OpenAPI / Swagger definition
├── controllers/           # Business logic handlers
│   ├── auth.controller.js
│   ├── event.controller.js
│   ├── category.controller.js
│   ├── registration.controller.js
│   ├── message.controller.js
│   └── user.controller.js
├── db/
│   └── db.js              # MongoDB connection
├── middleware/
│   ├── requireAuth.js     # JWT verification middleware
│   ├── requireRole.js     # Role-based access middleware
│   ├── validator.js       # express-validator error handler (422)
│   └── errorHandler.js    # Centralized error handler
├── modules/               # Mongoose models
│   ├── user.model.js
│   ├── event.model.js
│   ├── category.model.js
│   ├── registration.model.js
│   └── message.model.js
├── routes/
│   ├── auth.route.js
│   ├── event.route.js
│   ├── category.route.js
│   ├── registration.route.js
│   ├── message.route.js
│   ├── user.route.js
│   └── announcement.route.js
├── tests/
│   ├── unit/
│   │   ├── AppError.test.js
│   │   └── asyncHandler.test.js
│   └── integration/
│       └── events.test.js
├── utils/
│   ├── appError.util.js   # Custom error class
│   └── asyncHandler.util.js
├── jest.config.js
├── server.js              # App entry point
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ahmedmousa-deci/event_paluse.git
cd event_paluse

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
# Fill in your values (see Environment Variables below)

# 4. Seed the database (optional)
npm run seed

# 5. Start the development server
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
MONGO_URL=mongodb+srv://<user>:<password>@cluster0.mongodb.net/<dbname>
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

| Variable         | Description                             |
| ---------------- | --------------------------------------- |
| `PORT`           | Port the server listens on              |
| `NODE_ENV`       | `development` or `production`           |
| `MONGO_URL`      | MongoDB connection string               |
| `JWT_SECRET`     | Secret key for signing JWT tokens       |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`, `1h`) |

---

## API Endpoints

### Auth — `/api/v1/auth`

| Method | Endpoint              | Auth   | Description                 |
| ------ | --------------------- | ------ | --------------------------- |
| `POST` | `/api/v1/auth/signup` | Public | Register a new user         |
| `POST` | `/api/v1/auth/login`  | Public | Login and receive JWT token |

### Events — `/api/v1/events`

| Method   | Endpoint             | Auth  | Description                             |
| -------- | -------------------- | ----- | --------------------------------------- |
| `GET`    | `/api/v1/events`     | Any   | List all events (paginated, filterable) |
| `GET`    | `/api/v1/events/:id` | Any   | Get a single event                      |
| `POST`   | `/api/v1/events`     | Admin | Create a new event                      |
| `PATCH`  | `/api/v1/events/:id` | Admin | Update an event                         |
| `DELETE` | `/api/v1/events/:id` | Admin | Delete an event                         |

**Query Parameters for GET /events:**

- `search` — filter by title
- `city` — filter by city
- `startDate` / `endDate` — date range (YYYY-MM-DD)
- `category` — filter by category ID
- `sortBy` — sort field (`date`, `registrations` — defaults to `date`)
- `order` — sort direction (`asc` or `desc` — defaults to `asc`)
- `page` / `limit` — pagination

### Categories — `/api/v1/categories`

| Method   | Endpoint                 | Auth  | Description         |
| -------- | ------------------------ | ----- | ------------------- |
| `GET`    | `/api/v1/categories`     | Any   | List all categories |
| `POST`   | `/api/v1/categories`     | Admin | Create a category   |
| `PATCH`  | `/api/v1/categories/:id` | Admin | Update a category   |
| `DELETE` | `/api/v1/categories/:id` | Admin | Delete a category   |

### Registrations — `/api/v1/registrations`

| Method   | Endpoint                    | Auth           | Description            |
| -------- | --------------------------- | -------------- | ---------------------- |
| `GET`    | `/api/v1/registrations`     | Admin          | List all registrations |
| `GET`    | `/api/v1/registrations/my`  | Attendee       | My registrations       |
| `POST`   | `/api/v1/registrations`     | Attendee/Admin | Register for an event  |
| `DELETE` | `/api/v1/registrations/:id` | Any            | Cancel a registration  |

### Announcements — `/api/announcements`

| Method | Endpoint                      | Auth   | Description              |
| ------ | ----------------------------- | ------ | ------------------------ |
| `POST` | `/api/announcements`          | Admin  | Send a live announcement |
| `GET`  | `/api/announcements/:eventId` | Public | Get announcement history |

---

## Real-Time Announcements

The API uses **Socket.io** for live event announcements.

### Flow

```
Attendee connects via Socket.io
    → emits "join-event" with eventId
    → joins event room

Admin sends POST /api/announcements
    → message saved to MongoDB
    → broadcast via io.to(room).emit("announcement", message)

Attendee receives "announcement" event instantly
```

### Socket Events

| Direction       | Event          | Payload                | Description                 |
| --------------- | -------------- | ---------------------- | --------------------------- |
| Client → Server | `join-event`   | `"eventId"` (string)   | Join an event room          |
| Client → Server | `join_event`   | `{ eventId }` (object) | Join a room (legacy)        |
| Client → Server | `leave_event`  | `{ eventId }`          | Leave an event room         |
| Server → Client | `announcement` | message object         | Live announcement broadcast |
| Server → Client | `joined`       | `{ room }`             | Confirmation of room join   |
| Server → Client | `join-error`   | `{ message }`          | Room join error             |

### Connecting with Authentication

Pass your JWT token when connecting:

```js
const socket = io("http://localhost:3000", {
  auth: { token: "Bearer eyJhbGci..." },
});

socket.emit("join-event", "64f3a1b2c5d6e7f8a9b0c1d2");

socket.on("announcement", (message) => {
  console.log("New announcement:", message.text);
});
```

---

## Authentication

All protected routes require a `Bearer` token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles

| Role       | Permissions                                                               |
| ---------- | ------------------------------------------------------------------------- |
| `attendee` | Read events, categories, registrations; register for events               |
| `admin`    | Full access — create/update/delete events, categories, send announcements |

---

## Validation & Error Handling

### Validation

All endpoints validate input before reaching controllers. Invalid requests return:

```json
{
  "status": 422,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Must be a valid email" },
    { "field": "password", "message": "Password must be at least 6 characters" }
  ]
}
```

### Error Response Matrix

| Error Type                     | HTTP Status                 |
| ------------------------------ | --------------------------- |
| Validation (express-validator) | `422 Unprocessable Entity`  |
| Mongoose ValidationError       | `400 Bad Request`           |
| Mongoose CastError (bad ID)    | `400 Bad Request`           |
| Duplicate Key (code 11000)     | `409 Conflict`              |
| Custom AppError                | Uses error`s statusCode     |
| Unhandled / Unknown            | `500 Internal Server Error` |

---

## API Documentation

Interactive Swagger UI is available when the server is running:

```
http://localhost:3000/api-docs
```

1. Open the URL in your browser
2. Click **Authorize** and paste your JWT token
3. Test any endpoint directly from the browser

---

## Testing

```bash
# Run all tests
npm test

# Run only unit tests
npx jest tests/unit

# Run only integration tests
npx jest tests/integration
```

### Test Coverage

| Suite                  | Tests | Description                                                           |
| ---------------------- | ----- | --------------------------------------------------------------------- |
| `AppError.test.js`     | 5     | Validates statusCode, status string, isOperational, Error inheritance |
| `asyncHandler.test.js` | 3     | Verifies req/res/next forwarding and error catching                   |
| `events.test.js`       | 6     | Auth checks, validation responses, health endpoint                    |

**Total: 14 passing tests across 3 suites**

---

## npm Scripts

| Command        | Description                                             |
| -------------- | ------------------------------------------------------- |
| `npm run dev`  | Start with `NODE_ENV=development` + nodemon auto-reload |
| `npm start`    | Start with `NODE_ENV=production`                        |
| `npm test`     | Run Jest test suite                                     |
| `npm run seed` | Seed the database with sample data                      |
