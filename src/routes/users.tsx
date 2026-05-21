import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
import { RouteGuard } from "../lib/auth";
import { useAuthRedirect } from "../lib/auth/useAuthRedirect";
import { useUsers, useUpdateUser, useDeleteUser, useProfile, useUpdateProfile, useChangePassword } from "../hooks/queries";
import { register } from "../lib/api/auth";

export const Route = createFileRoute("/users")({
  component: () => (
    <RouteGuard allowedRoles={["admin"]}>
      <DashboardLayout><UsersPage /></DashboardLayout>
    </RouteGuard>
  ),
  head: () => ({ meta: [{ title: "User Management - Motorbike CRM" }] }),
});

const roleColor: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  sales: "bg-sky-100 text-sky-700",
  financing: "bg-emerald-100 text-emerald-700",
  advertising: "bg-orange-100 text-orange-700",
  marketing: "bg-pink-100 text-pink-700",
  service: "bg-slate-200 text-slate-700",
};

function UsersPage() {
  useAuthRedirect();
  const usersQ = useUsers();
  const profileQ = useProfile();
  const updateUserMut = useUpdateUser();
  const deleteUserMut = useDeleteUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const createUserMut = useMutation((data: any) => register(data), { onSuccess: () => usersQ.refetch() });

  const [openNew, setOpenNew] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [openProfileEdit, setOpenProfileEdit] = useState(false);
  const [openChangePwd, setOpenChangePwd] = useState(false);

  if (usersQ.isLoading) return <Card className="p-6 animate-pulse" />;
  if (usersQ.isError) return <Card className="p-6"><p>Failed to load users</p><div className="pt-2"><Button onClick={()=>usersQ.refetch()}>Retry</Button></div></Card>;

  const list = usersQ.data || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3"><div><h1 className="text-2xl font-bold tracking-tight">User Management</h1><p className="text-xs text-muted-foreground mt-1">Admins see all pages. Other roles see only their allowed modules.</p></div><div className="flex gap-2"><Button onClick={()=>setOpenProfileEdit(true)}>Edit Profile</Button><Button onClick={()=>setOpenChangePwd(true)}>Change Password</Button><UserModal open={openNew} onOpenChange={setOpenNew} creating={createUserMut.isLoading} onCreate={(p:any)=> createUserMut.mutate(p)} /></div></div>
      <Card><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Username</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{list.map((u:any) => <TableRow key={u.id}><TableCell className="font-medium">{u.first_name} {u.last_name}</TableCell><TableCell className="font-mono text-xs">{u.username}</TableCell><TableCell className="text-muted-foreground">{u.email}</TableCell><TableCell><Badge className={roleColor[u.role]}>{u.role}</Badge></TableCell><TableCell>{u.phone}</TableCell><TableCell><Badge className={u.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>{u.is_active ? 'Active' : 'Inactive'}</Badge></TableCell><TableCell className="text-right"><div className="inline-flex gap-1"><Button size="icon" variant="ghost" onClick={()=>{ setEditUser(u); setOpenNew(true); }}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-destructive" onClick={()=>{ if (confirm('Delete user?')) deleteUserMut.mutate(u.id); }}><Trash2 className="h-4 w-4" /></Button></div></TableCell></TableRow>)}</TableBody></Table></CardContent></Card>

      <ProfileModal open={openProfileEdit} onOpenChange={setOpenProfileEdit} profile={profileQ.data} updating={updateProfile.isLoading} onUpdate={(p:any)=> updateProfile.mutate(p)} />
      <ChangePasswordModal open={openChangePwd} onOpenChange={setOpenChangePwd} changing={changePassword.isLoading} onChange={(p:any)=> changePassword.mutate(p)} />
    </div>
  );
}

function UserModal({ open, onOpenChange, creating, onCreate, initialData }: any) {
  const [isOpen, setIsOpen] = useState(Boolean(open));
  const [form, setForm] = useState<any>(initialData || { first_name: "", last_name: "", username: "", email: "", role: "sales", phone: "", password: "", password2: "" });

  if (open !== undefined && open !== isOpen) setIsOpen(open);

  async function submit(e?: any) {
    e?.preventDefault();
    try {
      await onCreate(form);
      setIsOpen(false);
      onOpenChange?.(false);
    } catch (err:any) {
      console.error(err);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v)=>{ setIsOpen(v); onOpenChange?.(v); }}>
      <DialogTrigger asChild><Button onClick={()=>setIsOpen(true)} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy"><Plus className="h-4 w-4 mr-1" /> Add User</Button></DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{form.id ? 'Edit User' : 'Add User'}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>First Name</Label><Input value={form.first_name} onChange={(e)=>setForm((s:any)=>({...s,first_name:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Last Name</Label><Input value={form.last_name} onChange={(e)=>setForm((s:any)=>({...s,last_name:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Username</Label><Input value={form.username} onChange={(e)=>setForm((s:any)=>({...s,username:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form.email} onChange={(e)=>setForm((s:any)=>({...s,email:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Role</Label><Select value={form.role} onValueChange={(v)=>setForm((s:any)=>({...s,role:v}))}><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger><SelectContent>{Object.keys(roleColor).map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={form.phone} onChange={(e)=>setForm((s:any)=>({...s,phone:e.target.value}))} /></div>
          {!form.id && <div className="space-y-1.5"><Label>Password</Label><Input type="password" value={form.password} onChange={(e)=>setForm((s:any)=>({...s,password:e.target.value}))} /></div>}
          {!form.id && <div className="space-y-1.5"><Label>Confirm Password</Label><Input type="password" value={form.password2} onChange={(e)=>setForm((s:any)=>({...s,password2:e.target.value}))} /></div>}
        </form>
        <DialogFooter><Button onClick={submit} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy" disabled={creating}>{creating ? 'Saving...' : (form.id ? 'Save Changes' : 'Create User')}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProfileModal({ open, onOpenChange, profile, updating, onUpdate }: any) {
  const [isOpen, setIsOpen] = useState(Boolean(open));
  const [form, setForm] = useState<any>(profile || {});
  if (open !== undefined && open !== isOpen) setIsOpen(open);

  async function submit(e?:any) {
    e?.preventDefault();
    await onUpdate(form);
    setIsOpen(false);
    onOpenChange?.(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v)=>{ setIsOpen(v); onOpenChange?.(v); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>First Name</Label><Input value={form?.first_name || ''} onChange={(e)=>setForm((s:any)=>({...s,first_name:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Last Name</Label><Input value={form?.last_name || ''} onChange={(e)=>setForm((s:any)=>({...s,last_name:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={form?.email || ''} onChange={(e)=>setForm((s:any)=>({...s,email:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Phone</Label><Input value={form?.phone || ''} onChange={(e)=>setForm((s:any)=>({...s,phone:e.target.value}))} /></div>
        </form>
        <DialogFooter><Button onClick={submit} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy" disabled={updating}>{updating ? 'Saving...' : 'Save'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChangePasswordModal({ open, onOpenChange, changing, onChange }: any) {
  const [isOpen, setIsOpen] = useState(Boolean(open));
  const [form, setForm] = useState<any>({ old_password: '', new_password: '', confirm_password: '' });
  if (open !== undefined && open !== isOpen) setIsOpen(open);

  async function submit(e?:any) {
    e?.preventDefault();
    await onChange({ old_password: form.old_password, new_password: form.new_password, confirm_password: form.confirm_password });
    setIsOpen(false);
    onOpenChange?.(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(v)=>{ setIsOpen(v); onOpenChange?.(v); }}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5"><Label>Old Password</Label><Input type="password" value={form.old_password} onChange={(e)=>setForm((s:any)=>({...s,old_password:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>New Password</Label><Input type="password" value={form.new_password} onChange={(e)=>setForm((s:any)=>({...s,new_password:e.target.value}))} /></div>
          <div className="space-y-1.5"><Label>Confirm New Password</Label><Input type="password" value={form.confirm_password} onChange={(e)=>setForm((s:any)=>({...s,confirm_password:e.target.value}))} /></div>
        </form>
        <DialogFooter><Button onClick={submit} className="bg-brand-orange hover:bg-brand-orange/90 text-brand-navy" disabled={changing}>{changing ? 'Saving...' : 'Change Password'}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
