"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { generateInvoiceNumber } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface InvoiceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    number: string;
    amount: number;
    dueDate: Date | null;
    status: string;
    projectId: string;
  };
  defaultProjectId?: string;
}

export function InvoiceForm({
  open,
  onOpenChange,
  editData,
  defaultProjectId,
}: InvoiceFormProps) {
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Draft");
  const [projectId, setProjectId] = useState("");
  const [previewNumber] = useState(() => generateInvoiceNumber());

  const { data: projects } = trpc.projects.list.useQuery(undefined, { enabled: open });
  const utils = trpc.useUtils();

  useEffect(() => {
    if (open) {
      setAmount(editData?.amount != null ? String(editData.amount) : "");
      setDueDate(
        editData?.dueDate
          ? new Date(editData.dueDate).toISOString().split("T")[0]
          : ""
      );
      setStatus(editData?.status || "Draft");
      setProjectId(editData?.projectId || defaultProjectId || "");
    }
  }, [open, editData, defaultProjectId]);

  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.clients.getById.invalidate();
      utils.dashboard.getStats.invalidate();
      utils.dashboard.getRecentActivity.invalidate();
      toast({ title: "Invoice created", description: "New invoice has been created." });
      onOpenChange(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.invoices.update.useMutation({
    onSuccess: () => {
      utils.invoices.list.invalidate();
      utils.clients.getById.invalidate();
      utils.dashboard.getStats.invalidate();
      utils.dashboard.getRecentActivity.invalidate();
      toast({ title: "Invoice updated", description: "Invoice has been updated." });
      onOpenChange(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const data = {
      amount: parseFloat(amount),
      dueDate: dueDate ? new Date(dueDate) : null,
      status: status as "Draft" | "Sent" | "Paid" | "Overdue",
      projectId,
    };

    if (editData) {
      updateMutation.mutate({ id: editData.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit Invoice" : "Create Invoice"}</DialogTitle>
          <DialogDescription>
            {editData
              ? "Update the invoice details below."
              : "Fill in the details to create a new invoice."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!editData && (
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input value={previewNumber} disabled className="bg-slate-50" />
              <p className="text-xs text-slate-500">Auto-generated on save</p>
            </div>
          )}

          {editData && (
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input value={editData.number} disabled className="bg-slate-50" />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="invoice-project">Project *</Label>
            <Select value={projectId} onValueChange={setProjectId} required>
              <SelectTrigger id="invoice-project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title} — {project.client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-amount">Amount ($) *</Label>
              <Input
                id="invoice-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-due">Due Date</Label>
              <Input
                id="invoice-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="invoice-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !projectId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editData ? "Updating..." : "Creating..."}
                </>
              ) : editData ? (
                "Update Invoice"
              ) : (
                "Create Invoice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
