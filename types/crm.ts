export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  notes: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { projects: number };
}

export interface Project {
  id: string;
  title: string;
  status: string;
  amount: number | null;
  deadline: Date | null;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
  client: { id: string; name: string };
  _count: { invoices: number };
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  dueDate: Date | null;
  status: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
  project: {
    title: string;
    client: { id: string; name: string };
  };
}

export interface ClientInvoice {
  id: string;
  number: string;
  amount: number;
  dueDate: Date | null;
  status: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientProject {
  id: string;
  title: string;
  status: string;
  amount: number | null;
  deadline: Date | null;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
  invoices: ClientInvoice[];
}

export interface ClientDetail extends Omit<Client, "_count"> {
  projects: ClientProject[];
}

export interface ActivityItem {
  id: string;
  type: "project" | "invoice";
  title: string;
  clientName: string;
  status: string;
  updatedAt: Date;
}

export interface DashboardStats {
  activeClients: number;
  activeProjects: number;
  unpaidTotal: number;
  unpaidCount: number;
  overdueItems: number;
}

export type InvoiceWithProject = ClientInvoice & { projectTitle: string };
