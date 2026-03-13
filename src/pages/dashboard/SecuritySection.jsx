import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { adminsApi } from "@/services/api";
import { Shield, Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import { adminCreateSchema, adminUpdateSchema, validateForm } from "@/lib/validation";

const SecuritySection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchAdmins = async () => {
    setLoading(true);
    try { setAdmins(await adminsApi.list()); } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  useEffect(() => { fetchAdmins(); }, []);

  const openCreate = () => {
    setEditingAdmin(null);
    setForm({ username: "", email: "", password: "" });
    setShowPassword(false);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const openEdit = (admin) => {
    setEditingAdmin(admin);
    setForm({ username: admin.username, email: admin.email, password: "" });
    setShowPassword(false);
    setFieldErrors({});
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const schema = editingAdmin ? adminUpdateSchema : adminCreateSchema;
    const { success, data, errors } = validateForm(schema, form);
    if (!success) {
      setFieldErrors(errors);
      toast({ title: "Validation Error", description: Object.values(errors)[0], variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (editingAdmin) {
        const updateData = { username: data.username, email: data.email };
        if (data.password) updateData.password = data.password;
        await adminsApi.update(editingAdmin.id, updateData);
        toast({ title: t("dashboard.security.updated") || "Admin updated" });
      } else {
        await adminsApi.create(data);
        toast({ title: t("dashboard.security.created") || "Admin created" });
      }
      setDialogOpen(false);
      fetchAdmins();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    try {
      await adminsApi.delete(id);
      toast({ title: t("dashboard.security.deleted") || "Admin deleted" });
      setDeleteConfirm(null);
      fetchAdmins();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const updateField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(p => ({ ...p, [field]: undefined }));
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">{t("dashboard.security.title") || "Security"}</h1>
          </div>
          <Button onClick={openCreate} size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">{t("dashboard.security.addAdmin") || "Add Admin"}</span><span className="xs:hidden">Add</span>
          </Button>
        </div>

        <GlassCard>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("dashboard.security.username") || "Username"}</TableHead>
                      <TableHead>{t("dashboard.security.email") || "Email"}</TableHead>
                      <TableHead>{t("dashboard.security.created") || "Created"}</TableHead>
                      <TableHead className="text-end">{t("dashboard.security.actions") || "Actions"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.username}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(admin.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(admin)} className="h-8 w-8 p-0">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(admin)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10" disabled={admin.id === user?.id}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {admins.map((admin) => (
                  <div key={admin.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{admin.username}</p>
                        <p className="text-xs text-muted-foreground truncate">{admin.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(admin.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(admin)} className="h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(admin)} className="h-7 w-7 p-0 text-destructive" disabled={admin.id === user?.id}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </motion.div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAdmin ? (t("dashboard.security.editAdmin") || "Edit Admin") : (t("dashboard.security.addAdmin") || "Add Admin")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="admin-username">{t("dashboard.security.username") || "Username"}</Label>
              <Input id="admin-username" value={form.username} onChange={e => updateField("username", e.target.value)} maxLength={50} placeholder="admin" className={fieldErrors.username ? "ring-2 ring-destructive" : ""} />
              {fieldErrors.username && <p className="text-xs text-destructive">{fieldErrors.username}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">{t("dashboard.security.email") || "Email"}</Label>
              <Input id="admin-email" type="email" value={form.email} onChange={e => updateField("email", e.target.value)} maxLength={255} placeholder="admin@example.com" className={fieldErrors.email ? "ring-2 ring-destructive" : ""} />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">
                {t("dashboard.security.password") || "Password"}
                {editingAdmin && <span className="text-xs text-muted-foreground ms-1">(leave blank to keep current)</span>}
              </Label>
              <div className="relative">
                <Input id="admin-password" type={showPassword ? "text" : "password"} value={form.password} onChange={e => updateField("password", e.target.value)} maxLength={128} placeholder="••••••••" className={`pe-10 ${fieldErrors.password ? "ring-2 ring-destructive" : ""}`} />
                <Button type="button" variant="ghost" size="sm" className="absolute end-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t("login.cancel") || "Cancel"}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                {editingAdmin ? (t("dashboard.security.save") || "Save") : (t("dashboard.security.create") || "Create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">{t("dashboard.security.confirmDelete") || "Delete Admin?"}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.security.deleteWarning") || "This action cannot be undone."} <strong>{deleteConfirm?.username}</strong> ({deleteConfirm?.email})
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>{t("login.cancel") || "Cancel"}</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm?.id)}>
              {t("dashboard.security.delete") || "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecuritySection;
