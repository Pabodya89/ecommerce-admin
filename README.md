# Role-Based eCommerce Admin Dashboard

Admin panel backend built with Node.js, Express, Sequelize, PostgreSQL, and AdminJS.

## Features

- Express + Sequelize + PostgreSQL
- AdminJS with all required resources:
  - User
  - Category
  - Product
  - Order
  - OrderItem
  - Setting
- Password hashing with `bcryptjs`
- JWT login endpoint (`/api/login`)
- Role-based access control in AdminJS:
  - Admin: full access
  - User: limited access (no Users/Settings resources)
- Custom AdminJS pages:
  - Dashboard (admin summary + user activity)
  - Settings page (admin editable key-value config)
- Dockerized PostgreSQL support

## Tech Stack

- Node.js
- Express
- Sequelize
- PostgreSQL
- AdminJS
- bcryptjs
- JWT
- Docker Compose

## Environment

Configure `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_db
DB_USER=ecommerce_user
DB_PASSWORD=1234
JWT_SECRET=your_super_secret_key_this_is_own_way
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

`DB_HOST=localhost` is for running Node on your host machine while PostgreSQL runs in Docker.

## Run PostgreSQL in Docker

```bash
docker compose up -d postgres
```

## Install and Run App Locally

```bash
npm install
npm run dev
```

App URLs:

- Server health: `http://localhost:3000/health`
- Admin panel: `http://localhost:3000/admin`
- API login endpoint (POST only): `http://localhost:3000/api/login`

If you open `/api/login` in a browser tab (GET request), the API now returns guidance to use POST with JSON body.

## Optional: Run Full Stack in Docker

```bash
docker compose up --build
```

In this mode, the app container uses `DB_HOST=postgres` from `docker-compose.yml`.

## Seed Data

To create demo users, categories, products, orders, and settings:

```bash
npm run data
```

Default users:

- Admin: from `ADMIN_EMAIL` / `ADMIN_PASSWORD`
- Regular users:
  - `user@gmail.com / 123456789`
  

## Auth API

### POST `/api/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response:

```json
{
  "token": "<jwt>",
  "role": "admin",
  "name": "Admin"
}
```

### GET `/api/me`

Header:

```text
Authorization: Bearer <jwt>
```

Returns the current user profile without password.

## Role-Based Rules

- Admin users can view and manage all resources and settings.
- Regular users can log in to AdminJS but cannot see `User` and `Setting` resources.
- Dashboard output changes based on role:
  - Admin: system-wide metrics (users/orders/products/revenue)
  - User: personal recent orders and total spent

## Branch Strategy

 Git workflow:

- `main`: production-ready branch
- `develop`: integration branch


Example:

```bash
git checkout -b develop
git add .
git commit -m "feat: add role-based AdminJS resources"
git push -u origin develop
```

 merge `develop` into `main` for release.


