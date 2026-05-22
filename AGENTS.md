# AGENTS.md — E-Commerce (Next.js + Prisma + PostgreSQL)

> This file is intended for AI coding agents. It describes the project architecture, conventions, and commands you need to know before making changes.

---

## 1. Project Overview

This is a **Next.js 14** e-commerce web application built with the App Router. It sits on top of an existing ERP/CRM PostgreSQL database and adds a public-facing storefront plus an affiliate-marketing layer. The UI is currently RTL-oriented (Arabic) and styled after the "Molla" e-commerce theme.

- **Framework**: Next.js 14.2.35 (App Router)
- **Language**: TypeScript 5 (strict mode enabled)
- **Styling**: Tailwind CSS 3.4.1 + custom CSS variables
- **Database**: PostgreSQL, accessed via Prisma ORM 7.8.0
- **Font**: Geist (local WOFF files loaded with `next/font/local`)

---

## 2. Repository Structure

```
.
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (wraps all pages, loads Geist fonts, renders <Header />)
│   ├── page.tsx            # Home page (demo / landing)
│   ├── globals.css         # Tailwind directives + global styles
│   └── fonts/              # GeistSans & GeistMono WOFF files
├── component/              # Reusable React components
│   └── header.tsx          # Storefront header (client component, RTL, Molla-style)
├── lib/                    # Shared utilities & singletons
│   └── prisma.ts           # Prisma Client instance with pg adapter
├── server/                 # Next.js Server Actions
│   └── home.ts             # Example: getHomePageData()
├── prisma/
│   └── schema.prisma       # Full database schema (ERP + affiliate tables)
├── generated/prisma/       # Prisma Client generated output (git-ignored)
├── package.json            # Dependencies & scripts
├── next.config.mjs         # Next.js config (currently empty/default)
├── tailwind.config.ts      # Tailwind content paths + theme extensions
├── tsconfig.json           # TypeScript config with path alias `@/*`
├── prisma.config.ts        # Prisma 7 config pointing at DATABASE_URL
└── .env                    # Environment variables (contains secrets — do not commit)
```

### Path Alias
- `@/*` resolves to the repository root (`./`).
- Example: `import { prisma } from "@/lib/prisma";`

---

## 3. Technology Stack Details

### Next.js / React
- Uses the **App Router** (`app/` directory).
- Pages are server components by default.
- Client components must explicitly declare `"use client";` at the top of the file.
- Server Actions must explicitly declare `"use server";` at the top of the file.

### Tailwind CSS
- Configured in `tailwind.config.ts`.
- Content globs cover `./app/**/*`, `./component/**/*`, and `./pages/**/*` (legacy safety).
- Custom theme colors `background` and `foreground` read from CSS variables.
- The storefront UI is heavily customized with arbitrary values (e.g., `bg-[#f4eade]`, `text-[#c96]`).

### Prisma / Database
- **Prisma version**: 7.8.0 (client + generator + CLI).
- **Adapter**: `@prisma/adapter-pg` using the native `pg` driver.
- **Schema**: `prisma/schema.prisma`.
- **Generator output**: `../generated/prisma` (relative to the schema file).
- The schema mixes two domains:
  1. **ERP/CRM** — Users, Permissions, Products, Categories, Orders, Customers, Warehouses, StockMovements, Expenses, etc.
  2. **E-Commerce Affiliate** — `AffiliateLink`, `Commission`, and affiliate-related fields on `User`, `Product`, `Order`, `OrderItem`.
- Key enums: `AccountType`, `EcommerceRole`, `CommissionStatus`, `MovementType`, `ExpenseType`, `ExpenseCurrency`, `PaidFromOffice`, `WarrantyType`.

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string (required at build & runtime).
- Loaded via `dotenv/config` in both `lib/prisma.ts` and `prisma.config.ts`.

---

## 4. Build & Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Next.js development server on `http://localhost:3000` |
| `npm run build` | Create an optimized production build |
| `npm run start` | Start the production server (requires a prior build) |
| `npm run lint` | Run Next.js ESLint |

### Prisma Commands (run via `npx prisma`)
| Command | Description |
|---------|-------------|
| `npx prisma generate` | Regenerate the Prisma Client into `generated/prisma/` |
| `npx prisma migrate dev` | Create & apply migrations in development |
| `npx prisma migrate deploy` | Apply pending migrations in production |
| `npx prisma studio` | Open Prisma Studio (visual DB editor) |
| `npx prisma db pull` | Introspect the database and update `schema.prisma` |

> **Important**: After any change to `prisma/schema.prisma`, run `npx prisma generate` so TypeScript can see the updated client types.

---

## 5. Code Organization & Conventions

### Component Placement
- **App-level pages & layouts** → `app/`
- **Reusable UI components** → `component/`
- **Server Actions** → `server/` (group by feature, e.g., `home.ts`)
- **Shared utilities / singletons** → `lib/`

### Client vs. Server
- Default to server components.
- Use `"use client";` only when you need:
  - React hooks (`useState`, `useEffect`, etc.)
  - Browser-only APIs (`localStorage`, `window`, etc.)
  - Interactive event handlers (`onClick`, `onChange`, etc.)
- Use `"use server";` for functions that:
  - Query or mutate the database via Prisma.
  - Must run exclusively on the server (secret keys, internal APIs).

### Naming Conventions
- Files use **PascalCase** for components (`header.tsx` is lowercase currently but contains a `Header` export).
- Files use **camelCase** for utilities and server actions.
- Prisma models use **PascalCase** (`AffiliateLink`, `ProductStock`).
- Database columns in Prisma use **camelCase**; explicit `@map("snake_case")` is used for the new affiliate tables.

### Styling Conventions
- Prefer Tailwind utility classes.
- The project uses inline arbitrary values heavily for the Molla theme palette:
  - Accent gold: `#c96`
  - Soft green: `#a6c76c`
  - Soft red: `#ef837b`
  - Teal: `#1cc0a0`
  - Page background: `#fafafa`
- RTL is applied via `dir="rtl"` on root elements in the current pages.

---

## 6. Testing Strategy

**There is currently no testing framework configured.**

If you add tests, the following are recommended based on common Next.js setups:
- **Unit / Component tests**: Vitest or Jest + React Testing Library.
- **E2E tests**: Playwright.
- Place test files next to the source files (e.g., `header.test.tsx`) or in a top-level `__tests__/` directory.

---

## 7. Security Considerations

- **`.env` is blocked from reading by secret-protection rules** — never commit it.
- `DATABASE_URL` contains credentials; it is only referenced server-side.
- The Prisma Client is instantiated in `lib/prisma.ts` with the `pg` adapter and should be imported from there (singleton pattern) to avoid connection-pool exhaustion.
- No authentication or authorization logic exists in the current storefront code (`page.tsx`, `header.tsx`). The underlying schema supports `AccountType` and `Permission` models, but any public-facing routes that expose sensitive ERP data must be guarded before deployment.
- No input validation library (e.g., Zod) is currently installed; validate all user inputs before passing them to Prisma queries.

---

## 8. Deployment Notes

- The project is a standard Next.js app and can be deployed to Vercel, Docker, or any Node.js host.
- **Required environment variable**: `DATABASE_URL` must be set in the production environment.
- Before deploying, run:
  1. `npx prisma generate` (to ensure `generated/prisma` exists).
  2. `npx prisma migrate deploy` (to apply pending migrations).
  3. `npm run build`.
- The `.gitignore` excludes `/.next/`, `/generated/prisma`, and `/node_modules`, so the build output and generated client must be produced on the deployment host.

---

## 9. Quick Checklist for Agents

Before editing code:
- [ ] Did you run `npx prisma generate` after any schema change?
- [ ] Is the file a Server Component, Client Component (`"use client"`), or Server Action (`"use server"`)? Mark it correctly.
- [ ] Are you importing Prisma from `@/lib/prisma` rather than creating a new client?
- [ ] Did you keep sensitive values out of committed files?
- [ ] If adding a new page, does it fit under `app/` following the App Router convention?
- [ ] If adding a reusable component, place it in `component/`.
- [ ] If adding a DB query/mutation, place it in `server/` as a Server Action.
