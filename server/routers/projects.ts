import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const projectsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        clientId: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        client: {
          userId: ctx.session.user.id,
        },
      };

      if (input?.status) {
        where.status = input.status;
      }

      if (input?.clientId) {
        where.clientId = input.clientId;
      }

      return ctx.prisma.project.findMany({
        where,
        include: {
          client: {
            select: { id: true, name: true },
          },
          _count: {
            select: { invoices: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          client: {
            userId: ctx.session.user.id,
          },
        },
        include: {
          client: true,
          invoices: {
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return project;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        status: z
          .enum(["Not Started", "In Progress", "Delivered", "Paid"])
          .default("Not Started"),
        amount: z.number().min(0).optional(),
        deadline: z.date().optional().nullable(),
        clientId: z.string().min(1, "Client is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify client ownership
      const client = await ctx.prisma.client.findFirst({
        where: { id: input.clientId, userId: ctx.session.user.id },
      });

      if (!client) {
        throw new Error("Client not found");
      }

      return ctx.prisma.project.create({
        data: input,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        status: z
          .enum(["Not Started", "In Progress", "Delivered", "Paid"])
          .optional(),
        amount: z.number().min(0).optional().nullable(),
        deadline: z.date().optional().nullable(),
        clientId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.prisma.project.findFirst({
        where: {
          id,
          client: { userId: ctx.session.user.id },
        },
      });

      if (!existing) {
        throw new Error("Project not found");
      }

      return ctx.prisma.project.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.project.findFirst({
        where: {
          id: input.id,
          client: { userId: ctx.session.user.id },
        },
      });

      if (!existing) {
        throw new Error("Project not found");
      }

      return ctx.prisma.project.delete({
        where: { id: input.id },
      });
    }),
});
