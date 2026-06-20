import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { generateInvoiceNumber } from "@/lib/utils";

export const invoicesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          projectId: z.string().optional(),
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

      if (input?.projectId) {
        where.projectId = input.projectId;
      }

      return ctx.prisma.invoice.findMany({
        where,
        include: {
          project: {
            include: {
              client: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
        include: {
          project: {
            include: {
              client: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      return invoice;
    }),

  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().min(0, "Amount must be positive"),
        dueDate: z.date().optional().nullable(),
        status: z.enum(["Draft", "Sent", "Paid", "Overdue"]).default("Draft"),
        notes: z.string().optional(),
        projectId: z.string().min(1, "Project is required"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.prisma.project.findFirst({
        where: {
          id: input.projectId,
          userId: ctx.user.id,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      const number = generateInvoiceNumber();

      return ctx.prisma.invoice.create({
        data: {
          ...input,
          notes: input.notes || null,
          number,
          userId: ctx.user.id,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().min(0).optional(),
        dueDate: z.date().optional().nullable(),
        status: z.enum(["Draft", "Sent", "Paid", "Overdue"]).optional(),
        notes: z.string().optional(),
        projectId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const existing = await ctx.prisma.invoice.findFirst({
        where: {
          id,
          userId: ctx.user.id,
        },
      });

      if (!existing) {
        throw new Error("Invoice not found");
      }

      return ctx.prisma.invoice.update({
        where: { id },
        data,
      });
    }),

  markAsPaid: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.invoice.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });

      if (!existing) {
        throw new Error("Invoice not found");
      }

      return ctx.prisma.invoice.update({
        where: { id: input.id },
        data: { status: "Paid" },
      });
    }),
});
