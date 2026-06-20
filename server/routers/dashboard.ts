import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const dashboardRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [activeClients, activeProjects, unpaidInvoices, overdueInvoices] =
      await Promise.all([
        ctx.prisma.client.count({
          where: { userId, status: "Active" },
        }),
        ctx.prisma.project.count({
          where: {
            client: { userId },
            status: { in: ["Not Started", "In Progress"] },
          },
        }),
        ctx.prisma.invoice.aggregate({
          where: {
            project: { client: { userId } },
            status: { in: ["Draft", "Sent", "Overdue"] },
          },
          _sum: { amount: true },
          _count: true,
        }),
        ctx.prisma.invoice.count({
          where: {
            project: { client: { userId } },
            status: "Overdue",
          },
        }),
      ]);

    return {
      activeClients,
      activeProjects,
      unpaidTotal: unpaidInvoices._sum.amount ?? 0,
      unpaidCount: unpaidInvoices._count,
      overdueItems: overdueInvoices,
    };
  }),

  getRecentActivity: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const [recentProjects, recentInvoices] = await Promise.all([
      ctx.prisma.project.findMany({
        where: { client: { userId } },
        include: {
          client: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      ctx.prisma.invoice.findMany({
        where: { project: { client: { userId } } },
        include: {
          project: {
            include: {
              client: { select: { name: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
    ]);

    // Merge and sort by updatedAt
    const activities = [
      ...recentProjects.map((p) => ({
        id: p.id,
        type: "project" as const,
        title: p.title,
        clientName: p.client.name,
        status: p.status,
        updatedAt: p.updatedAt,
      })),
      ...recentInvoices.map((i) => ({
        id: i.id,
        type: "invoice" as const,
        title: `Invoice ${i.number}`,
        clientName: i.project.client.name,
        status: i.status,
        updatedAt: i.updatedAt,
      })),
    ]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);

    return activities;
  }),
});
