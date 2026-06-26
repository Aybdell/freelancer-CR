"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
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

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    title: string;
    status: string;
    amount: number | null;
    deadline: Date | null;
    clientId: string;
  };
  defaultClientId?: string;
}

export function ProjectForm({
  open,
  onOpenChange,
  editData,
  defaultClientId,
}: ProjectFormProps) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [amount, setAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [clientId, setClientId] = useState("");

  const { data: clients } = trpc.clients.list.useQuery(undefined, { enabled: open });
  const utils = trpc.useUtils();

  useEffect(() => {
    if (open) {
      setTitle(editData?.title || "");
      setStatus(editData?.status || "Not Started");
      setAmount(editData?.amount != null ? String(editData.amount) : "");
      setDeadline(
        editData?.deadline
          ? new Date(editData.deadline).toISOString().split("T")[0]
          : ""
      );
      setClientId(editData?.clientId || defaultClientId || "");
    }
  }, [open, editData, defaultClientId]);

  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      utils.clients.getById.invalidate();
      utils.dashboard.getStats.invalidate();
      utils.dashboard.getRecentActivity.invalidate();
      toast({ title: "Project created", description: "New project has been added." });
      onOpenChange(false);
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      utils.projects.list.invalidate();
      utils.clients.getById.invalidate();
      utils.dashboard.getRecentActivity.invalidate();
      toast({ title: "Project updated", description: "Project has been updated." });
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
      title,
      status: status as "Not Started" | "In Progress" | "Delivered" | "Paid",
      amount: amount ? parseFloat(amount) : undefined,
      deadline: deadline ? new Date(deadline) : null,
      clientId,
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
          <DialogTitle>{editData ? "Edit Project" : "Add New Project"}</DialogTitle>
          <DialogDescription>
            {editData
              ? "Update the project details below."
              : "Fill in the details to create a new project."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="project-title">Title *</Label>
            <Input
              id="project-title"
              placeholder="Project title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-client">Client *</Label>
            <Select value={clientId} onValueChange={setClientId} required>
              <SelectTrigger id="project-client">
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="project-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-amount">Amount ($)</Label>
              <Input
                id="project-amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-deadline">Deadline</Label>
            <Input
              id="project-deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !clientId}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editData ? "Updating..." : "Creating..."}
                </>
              ) : editData ? (
                "Update Project"
              ) : (
                "Add Project"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
