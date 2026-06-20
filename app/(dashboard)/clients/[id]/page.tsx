"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClientForm } from "@/components/clients/client-form";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Mail, Phone, Pencil, FolderKanban, FileText, Building2 } from "lucide-react";
import type {
  ClientDetail,
  ClientProject,
  ClientInvoice,
  InvoiceWithProject,
} from "@/types/crm";

export default function ClientDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [showEditForm, setShowEditForm] = useState(false);

  const { data: client, isLoading } = trpc.clients.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <h2 className="text-lg font-semibold text-slate-900">Client not found</h2>
        <p className="mt-2 text-sm text-slate-500">
          This client may have been deleted or you don&apos;t have access.
        </p>
        <Button asChild className="mt-6">
          <Link href="/clients">Back to clients</Link>
        </Button>
      </div>
    );
  }

  const allInvoices: InvoiceWithProject[] = (client.projects as ClientProject[]).flatMap(
    (p: ClientProject) =>
      p.invoices.map((inv: ClientInvoice) => ({
        ...inv,
        projectTitle: p.title,
      }))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {client.name}
              </h1>
              <StatusBadge status={client.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">Client details and related work</p>
          </div>
        </div>
        <Button onClick={() => setShowEditForm(true)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Client
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Email:</span>
            <span className="font-medium text-slate-900">
              {client.email || "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Phone:</span>
            <span className="font-medium text-slate-900">
              {client.phone || "—"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="text-slate-500">Company:</span>
            <span className="font-medium text-slate-900">
              {client.company || "—"}
            </span>
          </div>
          {client.notes && (
            <div className="sm:col-span-2">
              <p className="text-sm text-slate-500">Notes</p>
              <p className="mt-1 text-sm text-slate-900">{client.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="projects">
        <TabsList>
          <TabsTrigger value="projects" className="gap-2">
            <FolderKanban className="h-4 w-4" />
            Projects ({client.projects.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <FileText className="h-4 w-4" />
            Invoices ({allInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          {client.projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-12 text-center">
              <FolderKanban className="h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-900">No projects yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Create a project for this client from the Projects page.
              </p>
              <Button asChild className="mt-4">
                <Link href="/projects">Go to Projects</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.projects.map((project: ClientProject) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>
                        <StatusBadge status={project.status} />
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(project.deadline)}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {project.amount != null ? formatCurrency(project.amount) : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices">
          {allInvoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-white py-12 text-center">
              <FileText className="h-8 w-8 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-900">No invoices yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Create an invoice from the Invoices page.
              </p>
              <Button asChild className="mt-4">
                <Link href="/invoices">Go to Invoices</Link>
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allInvoices.map((invoice: InvoiceWithProject) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell className="text-slate-500">{invoice.projectTitle}</TableCell>
                      <TableCell className="text-slate-500">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {formatDate(invoice.dueDate)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ClientForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        editData={client as ClientDetail}
      />
    </div>
  );
}
