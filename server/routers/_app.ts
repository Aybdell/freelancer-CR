import { createTRPCRouter } from "@/server/trpc";
import { clientsRouter } from "@/server/routers/clients";
import { projectsRouter } from "@/server/routers/projects";
import { invoicesRouter } from "@/server/routers/invoices";
import { dashboardRouter } from "@/server/routers/dashboard";

export const appRouter = createTRPCRouter({
  clients: clientsRouter,
  projects: projectsRouter,
  invoices: invoicesRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
