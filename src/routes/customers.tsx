import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Search, Eye, Pencil, Trash2, TriangleAlert, Users } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import CustomerAvatar from "@/components/CustomerAvatar";
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import {
  useCreateCustomer,
  useCustomers,
  useDeleteCustomer,
  useUpdateCustomer,
  useUsers,
} from "../hooks/queries";

export const Route = createFileRoute("/customers")({
  component: () => (
    <RouteGuard allowedRoles={["admin", "sales"]}>
      <DashboardLayout>
        <Customers />
      </DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "Customers - Motorbike CRM" }] }),
});

type CustomerStatus = "prospect" | "active" | "inactive";

interface Customer {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string;
  alt_phone: string | null;
  id_number: string | null;
  region: string | null;
  district: string | null;
  address: string | null;
  customer_type: "individual" | "business";
  status: CustomerStatus;
  budget: string | null;
  preferred_bike_type: string | null;
  how_heard: string | null;
  notes: string | null;
  profile_picture: string | null;
  initials: string;
  avatar_color: string;
  has_photo: boolean;
  assigned_to: number | null;
  assigned_to_name: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

type PaginatedCustomers = {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Customer[];
};

type UserOption = {
  id: number;
  name?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

type CustomerFormValues = {
  first_name: string;
  last_name: string;
  phone: string;
  alt_phone: string;
  email: string;
  id_number: string;
  region: string;
  district: string;
  address: string;
  customer_type: "individual" | "business";
  status: CustomerStatus;
  budget: string;
  preferred_bike_type: string;
  how_heard: string;
  notes: string;
  assigned_to: string;
  profile_picture: File | null;
};

const PAGE_SIZE = 20;

const defaultFormValues: CustomerFormValues = {
  first_name: "",
  last_name: "",
  phone: "",
  alt_phone: "",
  email: "",
  id_number: "",
  region: "",
  district: "",
  address: "",
  customer_type: "individual",
  status: "prospect",
  budget: "",
  preferred_bike_type: "",
  how_heard: "",
  notes: "",
  assigned_to: "unassigned",
  profile_picture: null,
};

function statusLabel(status: CustomerStatus) {
  if (status === "active") return "Active";
  if (status === "inactive") return "Inactive";
  return "Prospect";
}

function statusClass(status: CustomerStatus) {
  const map: Record<CustomerStatus, string> = {
    active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    inactive: "bg-rose-100 text-rose-700 hover:bg-rose-100",
    prospect: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  };
  return map[status];
}

function extractCustomerPayload(payload: unknown): {
  customers: Customer[];
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
} {
  if (Array.isArray(payload)) {
    return {
      customers: payload as Customer[],
      total: payload.length,
      hasNext: false,
      hasPrevious: false,
    };
  }

  const paginated = (payload ?? {}) as PaginatedCustomers;
  const customers = paginated.results ?? [];

  return {
    customers,
    total: paginated.count ?? customers.length,
    hasNext: Boolean(paginated.next),
    hasPrevious: Boolean(paginated.previous),
  };
}

function buildQuery(search: string, status: string, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status !== "all") params.set("status", status);
  params.set("page", String(page));
  params.set("page_size", String(PAGE_SIZE));
  return `?${params.toString()}`;
}

function mapCustomerToForm(customer: Customer): CustomerFormValues {
  return {
    first_name: customer.first_name,
    last_name: customer.last_name,
    phone: customer.phone,
    alt_phone: customer.alt_phone ?? "",
    email: customer.email ?? "",
    id_number: customer.id_number ?? "",
    region: customer.region ?? "",
    district: customer.district ?? "",
    address: customer.address ?? "",
    customer_type: customer.customer_type,
    status: customer.status,
    budget: customer.budget ?? "",
    preferred_bike_type: customer.preferred_bike_type ?? "",
    how_heard: customer.how_heard ?? "",
    notes: customer.notes ?? "",
    assigned_to: customer.assigned_to != null ? String(customer.assigned_to) : "unassigned",
    profile_picture: null,
  };
}

function toCustomerPayload(values: CustomerFormValues) {
  return {
    first_name: values.first_name,
    last_name: values.last_name,
    phone: values.phone,
    alt_phone: values.alt_phone || null,
    email: values.email || null,
    id_number: values.id_number || null,
    region: values.region || null,
    district: values.district || null,
    address: values.address || null,
    customer_type: values.customer_type,
    status: values.status,
    budget: values.budget || null,
    preferred_bike_type: values.preferred_bike_type || null,
    how_heard: values.how_heard || null,
    notes: values.notes || null,
    assigned_to: values.assigned_to !== "unassigned" ? Number(values.assigned_to) : null,
    profile_picture: null,
  };
}

function Customers() {
  useAuthRedirect();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const queryString = useMemo(
    () => buildQuery(search, statusFilter, page),
    [search, statusFilter, page],
  );

  const customersQuery = useCustomers(queryString);
  const usersQuery = useUsers();
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const payload = extractCustomerPayload(customersQuery.data);
  const customers = payload.customers;
  const total = payload.total;
  const startIndex = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIndex = total === 0 ? 0 : Math.min(page * PAGE_SIZE, total);

  const staffOptions = Array.isArray(usersQuery.data)
    ? (usersQuery.data as UserOption[])
    : (((usersQuery.data as { results?: UserOption[] } | undefined)?.results ??
        []) as UserOption[]);

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCustomer) return;
    await deleteCustomer.mutateAsync(deletingCustomer.id);
    setDeletingCustomer(null);
  };

  if (customersQuery.isLoading) {
    return <CustomersLoadingState />;
  }

  if (customersQuery.isError) {
    return <CustomersErrorState onRetry={() => customersQuery.refetch()} />;
  }

  if (total === 0) {
    return (
      <>
        <CustomersEmptyState onAddCustomer={handleAdd} />
        <CustomerFormDialog
          open={modalOpen}
          onOpenChange={setModalOpen}
          customer={editingCustomer}
          onCreate={createCustomer.mutateAsync}
          onUpdate={updateCustomer.mutateAsync}
          users={staffOptions}
          isSubmitting={createCustomer.isPending || updateCustomer.isPending}
        />
      </>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <Button
            className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"
            onClick={handleAdd}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Customer
          </Button>
        </div>

        <Card className="p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <CustomerAvatar
                      profilePicture={customer.profile_picture}
                      initials={customer.initials}
                      avatarColor={customer.avatar_color}
                      size="md"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{customer.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.phone}</TableCell>
                  <TableCell>{customer.region || "-"}</TableCell>
                  <TableCell>
                    <Badge className={statusClass(customer.status)}>
                      {statusLabel(customer.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.assigned_to_name || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setViewingCustomer(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(customer)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setDeletingCustomer(customer)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex} to {endIndex} of {total} customers
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={!payload.hasPrevious || page === 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={!payload.hasNext}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <CustomerFormDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        customer={editingCustomer}
        onCreate={createCustomer.mutateAsync}
        onUpdate={updateCustomer.mutateAsync}
        users={staffOptions}
        isSubmitting={createCustomer.isPending || updateCustomer.isPending}
      />

      <CustomerProfileSheet
        customer={viewingCustomer}
        open={!!viewingCustomer}
        onOpenChange={(open) => {
          if (!open) {
            setViewingCustomer(null);
          }
        }}
      />

      <AlertDialog
        open={!!deletingCustomer}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingCustomer(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deletingCustomer?.full_name || "this customer"}? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deleteCustomer.isPending}
            >
              {deleteCustomer.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CustomersLoadingState() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-10 w-full md:w-[180px]" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-7 gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function CustomersErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="p-8">
      <div className="flex flex-col items-center text-center gap-3">
        <TriangleAlert className="h-10 w-10 text-destructive" />
        <h2 className="text-xl font-semibold">Failed to load customers</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          Could not connect to server. Please check your connection and try again.
        </p>
        <Button onClick={onRetry}>Retry</Button>
      </div>
    </Card>
  );
}

function CustomersEmptyState({ onAddCustomer }: { onAddCustomer: () => void }) {
  return (
    <Card className="p-10">
      <div className="flex flex-col items-center text-center gap-3">
        <Users className="h-10 w-10 text-muted-foreground" />
        <h2 className="text-xl font-semibold">No customers yet</h2>
        <p className="text-sm text-muted-foreground">Start by adding your first customer</p>
        <Button
          className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"
          onClick={onAddCustomer}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Customer
        </Button>
      </div>
    </Card>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

function CustomerFormDialog({
  open,
  onOpenChange,
  customer,
  onCreate,
  onUpdate,
  users,
  isSubmitting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  onCreate: (data: any) => Promise<unknown>;
  onUpdate: (data: { id: number; data: any }) => Promise<unknown>;
  users: UserOption[];
  isSubmitting: boolean;
}) {
  const [values, setValues] = useState<CustomerFormValues>(defaultFormValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setValues(defaultFormValues);
      setErrors({});
      return;
    }

    if (customer) {
      setValues(mapCustomerToForm(customer));
    } else {
      setValues(defaultFormValues);
    }
  }, [customer, open]);

  const updateField = <K extends keyof CustomerFormValues>(
    key: K,
    value: CustomerFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!values.first_name.trim()) nextErrors.first_name = "First Name is required";
    if (!values.last_name.trim()) nextErrors.last_name = "Last Name is required";
    if (!values.phone.trim()) nextErrors.phone = "Phone is required";
    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      const payload = toCustomerPayload(values);
      if (customer) {
        await onUpdate({ id: customer.id, data: payload });
      } else {
        await onCreate(payload);
      }
      onOpenChange(false);
    } catch (error) {
      setErrors({
        form: error instanceof Error ? error.message : "Failed to save customer",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? "Edit Customer" : "Add Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>First Name</Label>
            <Input
              value={values.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
            />
            <FieldError message={errors.first_name} />
          </div>
          <div className="space-y-1.5">
            <Label>Last Name</Label>
            <Input
              value={values.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
            />
            <FieldError message={errors.last_name} />
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={values.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
            <FieldError message={errors.email} />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input value={values.phone} onChange={(e) => updateField("phone", e.target.value)} />
            <FieldError message={errors.phone} />
          </div>
          <div className="space-y-1.5">
            <Label>Alt Phone</Label>
            <Input
              value={values.alt_phone}
              onChange={(e) => updateField("alt_phone", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>ID Number</Label>
            <Input
              value={values.id_number}
              onChange={(e) => updateField("id_number", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Region</Label>
            <Input value={values.region} onChange={(e) => updateField("region", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>District</Label>
            <Input
              value={values.district}
              onChange={(e) => updateField("district", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Address</Label>
            <Input
              value={values.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Customer Type</Label>
            <Select
              value={values.customer_type}
              onValueChange={(value) =>
                updateField("customer_type", value as "individual" | "business")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select
              value={values.status}
              onValueChange={(value) => updateField("status", value as CustomerStatus)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Budget</Label>
            <Input
              type="number"
              value={values.budget}
              onChange={(e) => updateField("budget", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Preferred Bike Type</Label>
            <Input
              value={values.preferred_bike_type}
              onChange={(e) => updateField("preferred_bike_type", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>How Heard About Us</Label>
            <Input
              value={values.how_heard}
              onChange={(e) => updateField("how_heard", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={values.notes}
              onChange={(e) => updateField("notes", e.target.value)}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Assigned To</Label>
            <Select
              value={values.assigned_to}
              onValueChange={(value) => updateField("assigned_to", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sales staff..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((user) => {
                  const label =
                    user.name ||
                    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
                    user.username ||
                    `User ${user.id}`;

                  return (
                    <SelectItem key={user.id} value={String(user.id)}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label>Profile Picture</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => updateField("profile_picture", e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              Image selection is captured in the form; actual upload handling should match backend
              file expectations.
            </p>
          </div>
          <div className="md:col-span-2">
            <FieldError message={errors.form} />
          </div>
          <DialogFooter className="md:col-span-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"
            >
              {isSubmitting
                ? customer
                  ? "Saving..."
                  : "Saving..."
                : customer
                  ? "Save Customer"
                  : "Save Customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomerProfileSheet({
  customer,
  open,
  onOpenChange,
}: {
  customer: Customer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        {customer ? (
          <>
            <SheetHeader>
              <SheetTitle>Customer Profile</SheetTitle>
              <SheetDescription>Full customer details and account information</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <CustomerAvatar
                  profilePicture={customer.profile_picture}
                  initials={customer.initials}
                  avatarColor={customer.avatar_color}
                  size="xl"
                />
                <div>
                  <h2 className="text-2xl font-semibold">{customer.full_name}</h2>
                  <Badge className={statusClass(customer.status)}>
                    {statusLabel(customer.status)}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <ProfileField label="Phone" value={customer.phone} />
                <ProfileField label="Alt Phone" value={customer.alt_phone} />
                <ProfileField label="Email" value={customer.email} />
                <ProfileField label="ID Number" value={customer.id_number} />
                <ProfileField label="Region" value={customer.region} />
                <ProfileField label="District" value={customer.district} />
                <ProfileField label="Address" value={customer.address} />
                <ProfileField label="Customer Type" value={customer.customer_type} />
                <ProfileField label="Budget" value={customer.budget} />
                <ProfileField label="Preferred Bike Type" value={customer.preferred_bike_type} />
                <ProfileField label="Assigned Salesperson" value={customer.assigned_to_name} />
                <ProfileField label="How Heard About Us" value={customer.how_heard} />
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Notes</h3>
                <Card className="p-4 text-sm text-muted-foreground">
                  {customer.notes || "No notes provided"}
                </Card>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function ProfileField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm">{value || "-"}</p>
    </div>
  );
}
