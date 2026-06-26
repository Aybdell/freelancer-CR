# FreelanceCRM

> Manage clients, projects, and invoices for your freelance business.

A full-stack CRM web application built for freelancers to manage their business operations — clients, projects, and invoices — all in one place with a clean, modern UI.

**Version:** 0.1.0 | **Author:** Aybdell

---

## Tech Stack

| Category          | Technology                                                  |
| ----------------- | ----------------------------------------------------------- |
| **Framework**     | Next.js 14 (App Router) + React 18 + TypeScript 5           |
| **Database**      | PostgreSQL via Supabase, Prisma 7 ORM (`@prisma/adapter-pg`) |
| **Auth**          | Supabase Auth (SSR)                                         |
| **API Layer**     | tRPC v10 with Zod validation, Superjson serialization       |
| **Data Fetching** | TanStack React Query (via tRPC)                             |
| **Styling**       | Tailwind CSS 3.4 + Radix UI primitives + Lucide icons       |
| **Deployment**    | Vercel                                                      |

---

## Features

### Authentication
- Email/password registration and login via Supabase Auth
- Protected routes with middleware (automatic redirect to `/login`)
- Session-aware UI with user avatar, name, and email in the sidebar
- Sign-out with session cleanup

### Dashboard (`/`)
- **4 stat cards**: Active Clients, Active Projects, Unpaid Total (formatted currency), Overdue Items
- **Recent activity feed**: Merged timeline of recently updated projects and invoices with status badges
- Loading skeletons and empty states for all async data

### Clients (`/clients`)
- Full CRUD: create, read, update, archive (soft-delete via status change)
- Client detail page with tabbed views (Projects / Invoices)
- Search by name, email, or company
- Filter by status: Lead / Active / Inactive
- Fields: name, email, phone, company, status, notes

### Projects (`/projects`)
- Full CRUD: create, read, update, delete (hard delete)
- Linked to a client via dropdown selector
- Filter by status: Not Started / In Progress / Delivered / Paid
- Fields: title, client, status, amount, deadline, notes
- Data integrity enforced — projects scoped to the authenticated user's clients

### Invoices (`/invoices`)
- Create, read, update, and quick "Mark as Paid" action
- Auto-generated unique invoice numbers (`INV-{timestamp}-{random}`)
- Linked to a project via dropdown selector
- Filter by status: Draft / Sent / Paid / Overdue
- Fields: invoice number, project, amount, due date, status, notes
- Data integrity enforced — invoices scoped to the authenticated user's projects

### Multi-Tenant Data Isolation
All data (clients, projects, invoices) is scoped by the authenticated user's `userId`. Every database query enforces this, so users only ever see their own data.

---

## Project Structure

```
app/
├── (auth)/              # Login & register pages (no sidebar)
├── (dashboard)/         # Dashboard, clients, projects, invoices (with sidebar)
└── api/trpc/[trpc]/     # tRPC HTTP handler

components/
├── ui/                  # Reusable primitives (button, dialog, table, etc.)
├── clients/             # Client form modal
├── projects/            # Project form modal
├── invoices/            # Invoice form modal
├── sidebar.tsx          # Navigation sidebar
└── providers.tsx        # tRPC + Toaster providers

server/routers/          # tRPC routers
├── clients.ts           # Client CRUD + archive
├── projects.ts          # Project CRUD
├── invoices.ts          # Invoice CRUD + markAsPaid
├── dashboard.ts         # Stats + recent activity
└── _app.ts              # Merged root router

prisma/
└── schema.prisma        # Database schema (Client, Project, Invoice)

lib/                     # Utilities (Prisma client, tRPC client, Supabase clients, helpers)
types/crm.ts             # Shared TypeScript interfaces
```

---

## Database Schema

Three models with full relational integrity:

- **Client** — `id`, `name`, `email?`, `phone?`, `company?`, `status`, `notes?`, `userId`, timestamps
- **Project** — `id`, `title`, `status`, `amount?`, `deadline?`, `notes?`, `userId`, `clientId`, timestamps
- **Invoice** — `id`, `number` (unique), `amount`, `dueDate?`, `status`, `notes?`, `userId`, `projectId`, timestamps

All models cascade-delete child records and are scoped to `userId`.

---

## Environment Variables

```env
DATABASE_URL=           # PostgreSQL connection string (Prisma)
DIRECT_URL=             # Direct connection for migrations
NEXT_PUBLIC_SUPABASE_URL=   # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY= # Supabase anonymous key
```

---

## Getting Started

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

---

## What Has Been Achieved

- **Complete authentication flow** — registration, login, session management, route protection, and sign-out using Supabase Auth
- **Client management** — full CRUD with search, filtering, archiving, and a detail page showing related projects and invoices
- **Project management** — full CRUD with status filtering, amount tracking, deadline, and client linking
- **Invoice management** — full CRUD with auto-generated invoice numbers, Mark as Paid, and status filtering
- **Dashboard** — at-a-glance business stats and a recent activity feed for quick overview
- **Type-safe full-stack architecture** — end-to-end type safety from database to UI via Prisma + tRPC + React Query
- **Input validation** — Zod schemas on all tRPC procedures ensuring data integrity
- **Data isolation** — every query is scoped to the authenticated user, providing multi-tenant security
- **Polished UI/UX** — responsive sidebar, dark/light mode support, loading skeletons, toast notifications for all operations, semantic status badges, empty states, and gradient accents
- **Deployment-ready** — configured for Vercel with custom build pipeline (`prisma generate && next build`)
- **PostgreSQL database** — three models with full relations, cascading deletes, and auto-generated fields

---

## License

Private — all rights reserved.
