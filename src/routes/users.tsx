import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { users } from "@/lib/mock-data";

export const Route = createFileRoute("/users")({
  component: () => <DashboardLayout><UsersPage /></DashboardLayout>,
  head: () => ({ meta: [{ title: "User Management — Motorbike CRM" }] }),
});

const roleColor: Record<string, string> = {
  Admin: "bg-purple-100 text-purple-700",
  Sales: "bg-sky-100 text-sky-700",
  Financing: "bg-emerald-100 text-emerald-700",
  Advertising: "bg-orange-100 text-orange-700",
  Marketing: "bg-pink-100 text-pink-700",
  Service: "bg-slate-200 text-slate-700",
};

function UsersPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
          <p className="text-xs text-muted-foreground mt-1">Admins see all pages · Sales sees Home, Customers, Inventory, Sales · Financing/Advertising/Marketing/Service see only their module.</p>
        </div>
        <UserModal />
      </div>
      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Username</TableHead><TableHead>Email</TableHead>
            <TableHead>Role</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {users.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="font-mono text-xs">{u.username}</TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell><Badge className={roleColor[u.role]}>{u.role}</Badge></TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell><Badge className={u.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>{u.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1">
                    <Button size="icon" variant="ghost"><Pencil className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}

function UserModal() {
  return (
    <Dialog>
      <DialogTrigger asChild><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> Add User</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add User</DialogTitle></DialogHeader>
        <form className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>First Name</Label><Input /></div>
          <div className="space-y-1.5"><Label>Last Name</Label><Input /></div>
          <div className="space-y-1.5"><Label>Username</Label><Input /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" /></div>
          <div className="space-y-1.5"><Label>Role</Label>
            <Select><SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
              <SelectContent>{Object.keys(roleColor).map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Phone</Label><Input /></div>
          <div className="space-y-1.5"><Label>Password</Label><Input type="password" /></div>
          <div className="space-y-1.5"><Label>Confirm Password</Label><Input type="password" /></div>
        </form>
        <DialogFooter><Button className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy">Create User</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
