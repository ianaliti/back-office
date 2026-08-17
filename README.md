# Yummy Back Office

A Next.js 16 back-office application for the Yummy restaurant platform.  
Protected routes for **Admin** and **Restaurant Owner** roles.

---

## Login Credentials

### Admin
| Field    | Value                  |
|----------|------------------------|
| Email    | `admin@yummy.com`      |
| Password | `Yummy@Admin2024`      |
| Role     | ADMIN                  |

Redirects to → `/admin/dashboard`

### Restaurant Owner
| Field    | Value                  |
|----------|------------------------|
| Email    | `owner@yummy.com`      |
| Password | `Yummy@Owner2024`      |
| Role     | RESTAURANT_OWNER       |

Redirects to → `/restaurant/dashboard`

---

## Running the App

### 1. Start the backend (Yummy API)

```bash
cd /Users/iana/yummy/backend/backend_MDSU
npm run dev
# API runs at http://localhost:3000
```

> The PostgreSQL container must be running: `docker start app_postgres`

### 2. Start the back-office

```bash
cd /path/to/back-office
npm run dev
# App runs at http://localhost:3002
```

Open [http://localhost:3002/login](http://localhost:3002/login) in your browser.

---

## Features

### Restaurant Owner
- Edit restaurant info (name, address, phone, website, cuisine, opening hours)
- Manage the menu — add, edit, delete dishes with price and availability
- Media management — add photo and video URLs

### Admin
- Dashboard with platform stats (users, restaurants, events)
- Full restaurant CRUD — create, edit, delete any restaurant
- User management — view all users and change their roles

---

## Tests

```bash
# Unit tests (Jest)
npm run test:jest

# End-to-end tests (Playwright) — requires dev server running
npm run test:e2e
```

---

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS v4
- **Auth**: JWT (access + refresh tokens via Yummy API)
- **Testing**: Jest + Testing Library, Playwright
