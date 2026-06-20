import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";

export const clientsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = {
        userId: ctx.user.id,
      };

      if (input?.status) {
        where.status = input.status;
      }

      if (input?.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { email: { contains: input.search, mode: "insensitive" } },
          { company: { contains: input.search, mode: "insensitive" } },
        ];
      }

      return ctx.prisma.client.findMany({
        where,
        include: {
          _count: {
            select: { projects: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.prisma.client.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          projects: {
            include: {
              invoices: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!client) {
        throw new Error("Client not found");
      }

      return client;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.enum(["Lead", "Active", "Inactive"]).default("Active"),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.client.create({
        data: {
          ...input,
          email: input.email || null,
          company: input.company || null,
          userId: ctx.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        company: z.string().optional(),
        status: z.enum(["Lead", "Active", "Inactive"]).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.prisma.client.findFirst({
        where: { id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new Error("Client not found");
      }

      return ctx.prisma.client.update({
        where: { id },
        data: {
          ...data,
          email: data.email || null,
          company: data.company || null,
        },
      });
    }),

  archive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.client.findFirst({
        where: { id: input.id, userId: ctx.user.id },
      });

      if (!existing) {
        throw new Error("Client not found");
      }

      return ctx.prisma.client.update({
        where: { id: input.id },
        data: { status: "Inactive" },
      });
    }),
});
