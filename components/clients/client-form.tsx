"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    company: string | null;
    status: string;
    notes: string | null;
  };
}

export function ClientForm({ open, onOpenChange, editData }: ClientFormProps) {
  const [name, setName] = useState(editData?.name || "");
  const [email, setEmail] = useState(editData?.email || "");
  const [phone, setPhone] = useState(editData?.phone || "");
  const [company, setCompany] = useState(editData?.company || "");
  const [status, setStatus] = useState(editData?.status || "Active");
  const [notes, setNotes] = useState(editData?.notes || "");

  useEffect(() => {
    if (open) {
      setName(editData?.name || "");
      setEmail(editData?.email || "");
      setPhone(editData?.phone || "");
      setCompany(editData?.company || "");
      setStatus(editData?.status || "Active");
      setNotes(editData?.notes || "");
    }
  }, [open, editData]);

  const utils = trpc.useUtils();

  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      utils.dashboard.getStats.invalidate();
      toast({ title: "Client created", description: "New client has been added successfully." });
      resetAndClose();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      utils.clients.list.invalidate();
      utils.clients.getById.invalidate();
      toast({ title: "Client updated", description: "Client has been updated successfully." });
      resetAndClose();
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const isLoading = createMutation.isLoading || updateMutation.isLoading;

  function resetAndClose() {
    if (!editData) {
      setName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setStatus("Active");
      setNotes("");
    }
    onOpenChange(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = { name, email, phone, company, status: status as "Lead" | "Active" | "Inactive", notes };

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
          <DialogTitle>{editData ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription>
            {editData
              ? "Update the client's information below."
              : "Fill in the details to add a new client."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-name">Name *</Label>
            <Input
              id="client-name"
              placeholder="Client name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-email">Email</Label>
              <Input
                id="client-email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-phone">Phone</Label>
              <Input
                id="client-phone"
                placeholder="+1 234 567 890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-company">Company</Label>
            <Input
              id="client-company"
              placeholder="Company name"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="client-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead">Lead</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-notes">Notes</Label>
            <Textarea
              id="client-notes"
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editData ? "Updating..." : "Creating..."}
                </>
              ) : editData ? (
                "Update Client"
              ) : (
                "Add Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
