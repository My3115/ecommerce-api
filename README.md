# E-commerce API

## 1. Introduction

E-commerce API is a RESTful API built with Node.js, Express.js, Prisma ORM, and PostgreSQL. It provides basic functionalities for managing products, authenticating users, processing orders, and tracking shipments.

## 2. Technologies

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- JSON Web Token (JWT)
- bcrypt
- Docker and Docker Compose

## 3. Features

- Health check and database connectivity check.
- Product CRUD: create, retrieve, update, and delete products.
- User registration and login.
- JWT-based authentication.
- Retrieve the current authenticated user.
- Create and retrieve customer orders.
- Validate product prices, quantities, and available stock.
- Retrieve shipment information.
- Restrict shipment status updates to administrators.
- Enforce authentication and order ownership checks.

## 4. Prerequisites

Install the following tools:

- Node.js and npm
- Docker Desktop
- Git (if cloning the project repository)

## 5. Environment Configuration

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://ecommerce_user:ecommerce_password@localhost:5432/ecommerce_db?schema=public"
PORT=3000
JWT_SECRET="ecommerce_mvp_secret_change_this_later"
JWT_EXPIRES_IN="1d"
```

Update the database credentials and JWT secret for your environment. Do not commit the `.env` file to version control.

## 6. Run the Project Locally

Install dependencies:

```bash
npm ci
```

Generate Prisma Client:

```bash
npx prisma generate
```

Start the API:

```bash
npm start
```

The API runs at `http://localhost:3000`.

## 7. Run with Docker Compose

Start the services:

```bash
docker compose up -d --build
```

Check service status:

```bash
docker compose ps
```

Check API logs:

```bash
docker compose logs api
```

Check the health endpoint:

```text
GET http://localhost:3000/health
```

Stop the services without deleting database volumes:

```bash
docker compose down
```

## 8. API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check API and database health |
| GET | `/api/products` | Retrieve products |
| GET | `/api/products/:id` | Retrieve a product |
| POST | `/api/products` | Create a product |
| PUT/PATCH | `/api/products/:id` | Update a product, according to the implemented route |
| DELETE | `/api/products/:id` | Delete a product |
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in and obtain a JWT |
| GET | `/api/auth/me` | Retrieve the current user |
| GET | `/api/orders` | Retrieve the authenticated customer's orders |
| GET | `/api/orders/:id` | Retrieve an order the customer owns |
| POST | `/api/orders` | Create an order |
| GET | `/api/shipments/:id` | Retrieve shipment information |
| PATCH | `/api/shipments/:id/status` | Update shipment status (administrator only) |

Protected endpoints require a JWT in the request header:

```text
Authorization: Bearer <access_token>
```

## 9. Testing

Run the automated API tests:

```bash
npm test
```

The test suite checks:

- API and database health.
- Product retrieval.
- Rejection of negative product prices.
- Rejection of negative product quantities.
- Customer login and JWT generation.
- Retrieval of the authenticated user.
- Authorization for shipment status updates.
- Rejection of unauthenticated order access.

## 10. Database

The project uses PostgreSQL. The Prisma schema contains the following models:

- `role`
- `user`
- `membership`
- `product`
- `orders`
- `order_detail`
- `shipment`

## 11. Notes

- Keep database credentials and JWT secrets private.
- Use valid product IDs and quantities when creating orders.
- Shipment status updates are restricted to administrators.
- Run `npm test` after starting the API to verify the tested functionalities.
