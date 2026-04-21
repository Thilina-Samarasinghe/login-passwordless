# 🔐 Login Passwordless

A production-ready **passwordless authentication system** built with Next.js, Prisma, and Neon PostgreSQL. Users authenticate via a **magic link** sent to their email — no passwords required. The system uses **JWT access tokens** with **rotating refresh tokens**, enforces a maximum of **2 concurrent sessions** per user, and stores tokens securely in **HTTP-only cookies**.

---

## ✨ Features

- 📧 **Magic Link Authentication** — Login via a secure, time-limited link sent to your email
- 🔑 **JWT Access Tokens** — Short-lived (15 min) signed tokens for API authorization
- 🔄 **Refresh Token Rotation** — Long-lived (7 days) tokens rotate on every use for maximum security
- 🛡️ **HTTP-only Cookie Storage** — Refresh tokens stored in cookies inaccessible to JavaScript
- 👥 **Session Limiting** — Maximum 2 concurrent sessions per user; oldest session is auto-revoked
- 🔒 **SHA-256 Token Hashing** — Refresh tokens are hashed before database storage
- 🌐 **Device & IP Tracking** — Session metadata (User-Agent, IP address) recorded per session
- 🚪 **Secure Logout** — Revokes the specific session token from the database
- 👤 **Auto User Provisioning** — New users are automatically created on first magic link verification
- 🧹 **Token Cleanup** — Magic link tokens are single-use and consumed immediately after verification

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Database** | [Neon PostgreSQL](https://neon.tech/) (Serverless) |
| **ORM** | [Prisma 5](https://www.prisma.io/) |
| **JWT Library** | [jose 6](https://github.com/panva/jose) |
| **Email** | [Nodemailer 8](https://nodemailer.com/) via SMTP (Brevo) |
| **Password Hashing** | [bcrypt 6](https://github.com/kelektiv/node.bcrypt.js) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Icons** | [Lucide React](https://lucide.dev/) |

---

## 📦 Dependencies & Versions

### Production Dependencies

| Package | Version | Purpose |
|---|---|---|
| `next` | `16.2.4` | React framework with App Router |
| `react` | `19.2.4` | UI library |
| `react-dom` | `19.2.4` | React DOM renderer |
| `@prisma/client` | `^5.22.0` | Database ORM client |
| `prisma` | `^5.22.0` | Prisma CLI & schema tools |
| `jose` | `^6.2.2` | JWT signing & verification (HMAC HS256) |
| `jsonwebtoken` | `^9.0.3` | JWT utilities |
| `bcrypt` | `^6.0.0` | Password/token hashing |
| `nodemailer` | `^8.0.5` | Email delivery (magic links) |
| `lucide-react` | `^1.8.0` | Icon components |

### Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| `typescript` | `^5` | Static type checking |
| `tailwindcss` | `^4` | Utility-first CSS framework |
| `@tailwindcss/postcss` | `^4` | PostCSS integration for Tailwind |
| `eslint` | `^9` | Code linting |
| `eslint-config-next` | `16.2.4` | Next.js ESLint rules |
| `@types/node` | `^20` | Node.js type definitions |
| `@types/react` | `^19` | React type definitions |
| `@types/react-dom` | `^19` | React DOM type definitions |
| `@types/bcrypt` | `^6.0.0` | bcrypt type definitions |
| `@types/jsonwebtoken` | `^9.0.10` | jsonwebtoken type definitions |
| `@types/nodemailer` | `^8.0.0` | nodemailer type definitions |

---

## 📁 File Structure

```
my-app/
├── prisma/
│   └── schema.prisma           # Database models (User, MagicToken, RefreshToken)
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── magic-link/ # POST /api/auth/magic-link
│   │   │       │   └── route.ts
│   │   │       ├── verify/     # POST /api/auth/verify
│   │   │       │   └── route.ts
│   │   │       ├── refresh/    # POST /api/auth/refresh
│   │   │       │   └── route.ts
│   │   │       ├── logout/     # POST /api/auth/logout
│   │   │       │   └── route.ts
│   │   │       └── me/         # GET  /api/auth/me
│   │   │           └── route.ts
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Protected dashboard page
│   │   ├── login/
│   │   │   └── page.tsx        # Magic link request page
│   │   ├── verify/
│   │   │   └── page.tsx        # Magic link verification page
│   │   ├── page.tsx            # Landing / home page
│   │   ├── layout.tsx          # Root layout with AuthProvider
│   │   └── globals.css         # Global styles
│   │
│   ├── context/
│   │   └── auth-context.tsx    # React auth context + useAuth hook
│   │
│   ├── lib/
│   │   ├── jwt.ts              # signAccessToken, signRefreshToken, verifyRefreshToken
│   │   ├── token.ts            # generateRawToken, hashToken, hashLongToken, verifyLongToken
│   │   ├── email.ts            # sendMagicLink (Nodemailer SMTP)
│   │   └── prisma.ts           # Prisma client singleton
│   │
│   ├── services/
│   │   └── auth.service.ts     # Core auth logic — magic link, verify, refresh, logout
│   │
│   └── proxy.ts                # Dev proxy / middleware helpers
│
├── .env                        # Environment variables (NOT committed)
├── .env.example                # Example env file for reference
├── .gitignore
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
└── package.json
```

---

## 🗄️ Database Schema

### `User`
| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `email` | `String` | Unique |
| `createdAt` | `DateTime` | Auto |
| `updatedAt` | `DateTime` | Auto |

### `MagicToken`
| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `email` | `String` | Indexed |
| `token` | `String` | bcrypt-hashed, unique |
| `expiresAt` | `DateTime` | 15 minutes from creation |
| `createdAt` | `DateTime` | Auto |

### `RefreshToken`
| Field | Type | Notes |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `token` | `String` | SHA-256-hashed, unique |
| `userId` | `String` | FK → User |
| `expiresAt` | `DateTime` | 7 days from creation |
| `userAgent` | `String?` | Device info |
| `ipAddress` | `String?` | Client IP |
| `createdAt` | `DateTime` | Auto, indexed |

---

## 🌐 API Endpoints

### `POST /api/auth/magic-link`
Sends a magic link to the given email address.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response `200`:**
```json
{
  "message": "Magic link sent to your email"
}
```

---

### `POST /api/auth/verify`
Verifies the magic link token and issues JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "<raw-token-from-email-link>"
}
```

**Response `200`:**
```json
{
  "accessToken": "<jwt-access-token>",
  "user": {
    "id": "clxxx...",
    "email": "user@example.com"
  }
}
```
> 🍪 Also sets an `httpOnly` **refresh token cookie** (`refreshToken`, path `/`, 7-day maxAge).

---

### `POST /api/auth/refresh`
Rotates the refresh token and returns a new access token.  
Reads the refresh token from the `refreshToken` HTTP-only cookie (or from the request body as `refreshToken` fallback).

**Response `200`:**
```json
{
  "accessToken": "<new-jwt-access-token>",
  "user": {
    "id": "clxxx...",
    "email": "user@example.com"
  }
}
```
> 🍪 Sets a **new** `refreshToken` cookie (old one is revoked from DB).

**Error `401`:**
```json
{ "error": "Invalid refresh token signature" }
{ "error": "Token expired or revoked" }
{ "error": "Refresh token missing" }
```

---

### `POST /api/auth/logout`
Revokes the current session's refresh token.

**Response `200`:**
```json
{ "message": "Logged out successfully" }
```
> 🍪 Clears the `refreshToken` cookie.

---

### `GET /api/auth/me`
Returns the currently authenticated user's profile.  
Requires a valid `Authorization: Bearer <accessToken>` header.

**Response `200`:**
```json
{
  "user": {
    "id": "clxxx...",
    "email": "user@example.com"
  }
}
```

**Error `401`:**
```json
{ "error": "Unauthorized" }
```

---

## 🔐 Authentication Flow

```
1. User enters email  →  POST /api/auth/magic-link
2. Email received     →  User clicks link  →  /verify?token=XXX&email=YYY
3. Frontend calls     →  POST /api/auth/verify  { email, token }
4. Server responds    →  accessToken (in body) + refreshToken (in cookie)
5. Access token expires (15m)  →  POST /api/auth/refresh
6. New access token issued     →  Refresh token rotated in DB + cookie
7. User logs out      →  POST /api/auth/logout  →  Cookie cleared + DB record deleted
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `my-app/` directory with the following:

```env
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Email credentials (SMTP — e.g. Brevo, Gmail)
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-smtp-password
EMAIL_FROM=your-email@example.com

# App base URL
BASE_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# JWT secrets — use long random strings in production
ACCESS_TOKEN_SECRET=your-long-random-access-secret
REFRESH_TOKEN_SECRET=your-long-random-refresh-secret
```

> ⚠️ **Never commit your `.env` file.** It is already excluded via `.gitignore`.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Thilina-Samarasinghe/login-passwordless.git
cd login-passwordless/my-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Fill in your values in .env
```

### 4. Push the database schema
```bash
npx prisma db push
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing with Postman

A full Postman collection (`Passwordless_Auth.postman_collection.json`) is included at the root of the repository. It covers:

- Request magic link
- Verify token
- Refresh access token
- Get current user (`/me`)
- Logout

Import it into Postman and run the requests in order.

---

## 📄 License

MIT — feel free to use and modify for your own projects.
