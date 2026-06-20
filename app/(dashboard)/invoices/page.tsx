"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvoiceForm } from "@/components/invoices/invoice-form";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/routers/_app";

type Invoice = inferRouterOutputs<AppRouter>["invoices"]["list"][number];
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, Pencil, CheckCircle, FileText, Plus } from "lucide-react";

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const { data: invoices, isLoading } = trpc.invoices.list.useQuery({
    status: statusFilter || undefined,
  });

  const utils = trpc.useUtils();

  const markPaidMutation = trpc.invoices.markAsPaid.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.dashboard.getStats.invalidate();
      utils.dashboard.getRecentActivity.invalidate();
      toast({ title: "Invoice paid", description: "Invoice marked as paid." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create and manage invoices for your projects.
          </p>
        </div>
        <Button onClick={() => { setEditInvoice(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Invoice
        </Button>
      </div>

      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="Draft">Draft</SelectItem>
          <SelectItem value="Sent">Sent</SelectItem>
          <SelectItem value="Paid">Paid</SelectItem>
          <SelectItem value="Overdue">Overdue</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !invoices?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">No invoices yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Create your first invoice to start billing clients.
          </p>
          <Button className="mt-6" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create your first invoice
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Number</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium text-slate-900">
                    {invoice.number}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {invoice.project.title}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {invoice.project.client.name}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatCurrency(invoice.amount)}
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatDate(invoice.dueDate)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditInvoice(invoice);
                            setShowForm(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        {invoice.status !== "Paid" && (
                          <DropdownMenuItem
                            onClick={() => markPaidMutation.mutate({ id: invoice.id })}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <InvoiceForm
        open={showForm}
        onOpenChange={setShowForm}
        editData={editInvoice ?? undefined}
      />
    </div>
  );
}
