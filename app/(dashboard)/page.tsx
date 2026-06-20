"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FolderKanban,
  DollarSign,
  AlertTriangle,
  ArrowRight,
  FileText,
} from "lucide-react";
import type { ActivityItem } from "@/types/crm";

const statCards = [
  {
    key: "activeClients" as const,
    label: "Active Clients",
    icon: Users,
    gradient: "from-emerald-500 to-teal-600",
    format: (v: number) => v.toString(),
  },
  {
    key: "activeProjects" as const,
    label: "Active Projects",
    icon: FolderKanban,
    gradient: "from-indigo-500 to-violet-600",
    format: (v: number) => v.toString(),
  },
  {
    key: "unpaidTotal" as const,
    label: "Unpaid Total",
    icon: DollarSign,
    gradient: "from-amber-500 to-orange-600",
    format: (v: number) => formatCurrency(v),
  },
  {
    key: "overdueItems" as const,
    label: "Overdue Items",
    icon: AlertTriangle,
    gradient: "from-red-500 to-rose-600",
    format: (v: number) => v.toString(),
  },
];

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.getStats.useQuery();
  const { data: activity, isLoading: activityLoading } =
    trpc.dashboard.getRecentActivity.useQuery();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of your freelance business at a glance.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card
            key={card.key}
            className="relative overflow-hidden border-slate-200"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.gradient}`}
            />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">
                {card.label}
              </CardTitle>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} shadow-sm`}
              >
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-3xl font-bold text-slate-900">
                  {card.format(stats?.[card.key] ?? 0)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Recent Activity
          </CardTitle>
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !activity?.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <FileText className="h-6 w-6 text-slate-400" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-900">No activity yet</p>
              <p className="mt-1 text-sm text-slate-500">
                Create a client or project to get started.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(activity as ActivityItem[]).map((item: ActivityItem) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        item.type === "project"
                          ? "bg-indigo-50 text-indigo-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.type === "project" ? (
                        <FolderKanban className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.clientName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={item.status} />
                    <span className="hidden text-xs text-slate-400 sm:block">
                      {formatDate(item.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
