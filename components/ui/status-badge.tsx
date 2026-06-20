import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "secondary" | "default"; label: string }> = {
  // Client statuses
  Lead: { variant: "default", label: "Lead" },
  Active: { variant: "success", label: "Active" },
  Inactive: { variant: "secondary", label: "Inactive" },

  // Project statuses
  "Not Started": { variant: "secondary", label: "Not Started" },
  "In Progress": { variant: "warning", label: "In Progress" },
  Delivered: { variant: "default", label: "Delivered" },
  Paid: { variant: "success", label: "Paid" },

  // Invoice statuses
  Draft: { variant: "secondary", label: "Draft" },
  Sent: { variant: "warning", label: "Sent" },
  Overdue: { variant: "danger", label: "Overdue" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || {
    variant: "secondary" as const,
    label: status,
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
