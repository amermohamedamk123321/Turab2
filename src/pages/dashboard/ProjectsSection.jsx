import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { projectsApi } from "@/services/api";
import { FolderOpen, Plus, Pencil, Trash2, Loader2, ExternalLink, ImagePlus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { projectSchema, validateForm } from "@/lib/validation";

const emptyForm = {
  title: "", description: "", status: "active",
  url: "", techTags: "", thumbnail: "", images: [],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) return "File too large (max 5MB)";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Invalid file type. Use JPEG, PNG, GIF, WebP, or SVG";
  return null;
};

const ProjectsSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const thumbnailRef = useRef(null);
  const galleryRef = useRef(null);

  const fetchProjects = async () => {
    setLoading(true);
    try { setProjects(await projectsApi.list()); } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFieldErrors({}); setDialogOpen(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || "", description: p.description || "",
      status: p.status || "active", url: p.url || "",
      techTags: Array.isArray(p.techTags) ? p.techTags.join(", ") : (p.techTags || ""),
      thumbnail: p.thumbnail || "", images: p.images || [],
    });
    setFieldErrors({});
    setDialogOpen(true);
  };

  const handleThumbnailChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateFile(file);
    if (error) { toast({ title: "Invalid file", description: error, variant: "destructive" }); return; }
    const base64 = await fileToBase64(file);
    setForm(f => ({ ...f, thumbnail: base64 }));
  };

  const handleGalleryAdd = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    for (const file of files) {
      const error = validateFile(file);
      if (error) { toast({ title: "Invalid file", description: `${file.name}: ${error}`, variant: "destructive" }); return; }
    }
    if (form.images.length + files.length > 20) {
      toast({ title: "Too many images", description: "Maximum 20 gallery images", variant: "destructive" }); return;
    }
    const newImages = await Promise.all(files.map(fileToBase64));
    setForm(f => ({ ...f, images: [...f.images, ...newImages] }));
    if (galleryRef.current) galleryRef.current.value = "";
  };

  const removeGalleryImage = (index) => {
    setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  };

  const updateField = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (fieldErrors[field]) setFieldErrors(p => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const { success, data, errors } = validateForm(projectSchema, form);
    if (!success) {
      setFieldErrors(errors);
      toast({ title: "Validation Error", description: Object.values(errors)[0], variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...data,
        techTags: data.techTags ? data.techTags.split(",").map(s => s.trim()).filter(Boolean) : [],
        thumbnail: form.thumbnail,
        images: form.images,
      };
      if (editing) {
        await projectsApi.update(editing.id, payload);
        toast({ title: "Project updated" });
      } else {
        await projectsApi.create(payload);
        toast({ title: "Project created" });
      }
      setDialogOpen(false);
      fetchProjects();
    } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    try { await projectsApi.delete(id); toast({ title: "Project deleted" }); setDeleteConfirm(null); fetchProjects(); }
    catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const statusColors = { active: "bg-green-500/10 text-green-600", completed: "bg-primary/10 text-primary", paused: "bg-yellow-500/10 text-yellow-600" };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">{t("dashboard.nav.projects") || "Projects"}</h1>
          </div>
          <Button onClick={openCreate} size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm"><Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">Add</span> Project</Button>
        </div>

        <GlassCard>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No projects yet. Add your first project!</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Technologies</TableHead>
                      <TableHead className="text-end">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-muted">
                            {p.thumbnail && p.thumbnail !== "/placeholder.svg" ? (
                              <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImagePlus className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{p.title}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {p.url ? <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3 w-3" /> Link</a> : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColors[p.status] || ""}>{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{Array.isArray(p.techTags) ? p.techTags.join(", ") : (p.techTags || "—")}</TableCell>
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-8 w-8 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(p)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="p-3 rounded-lg border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 shrink-0 rounded-md overflow-hidden bg-muted">
                        {p.thumbnail && p.thumbnail !== "/placeholder.svg" ? (
                          <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImagePlus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium truncate">{p.title}</p>
                          <Badge variant="secondary" className={`shrink-0 text-[10px] ${statusColors[p.status] || ""}`}>{p.status}</Badge>
                        </div>
                        {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"><ExternalLink className="h-3 w-3" /> Link</a>}
                        <p className="text-xs text-muted-foreground mt-1 truncate">{Array.isArray(p.techTags) ? p.techTags.join(", ") : ""}</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-1 mt-2 pt-2 border-t border-border">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-7 w-7 p-0"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(p)} className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
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
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Project" : "Add Project"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => updateField("title", e.target.value)} maxLength={200} placeholder="Project name" className={fieldErrors.title ? "ring-2 ring-destructive" : ""} />
              {fieldErrors.title && <p className="text-xs text-destructive">{fieldErrors.title}</p>}
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={form.url} onChange={e => updateField("url", e.target.value)} maxLength={500} placeholder="https://..." className={fieldErrors.url ? "ring-2 ring-destructive" : ""} />
              {fieldErrors.url && <p className="text-xs text-destructive">{fieldErrors.url}</p>}
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <select value={form.status} onChange={e => updateField("status", e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Technologies (comma-separated)</Label>
              <Input value={form.techTags} onChange={e => updateField("techTags", e.target.value)} maxLength={500} placeholder="React, Node.js, PostgreSQL" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => updateField("description", e.target.value)} maxLength={5000} placeholder="Project description..." rows={3} />
              <p className="text-xs text-muted-foreground text-end">{(form.description || "").length}/5000</p>
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>
              <div className="flex items-center gap-4">
                {form.thumbnail ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                    <img src={form.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, thumbnail: "" }))} className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => thumbnailRef.current?.click()} className="w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors">
                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Upload</span>
                  </button>
                )}
                <input ref={thumbnailRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" onChange={handleThumbnailChange} className="hidden" />
                {form.thumbnail && (
                  <Button type="button" variant="outline" size="sm" onClick={() => thumbnailRef.current?.click()}>Change</Button>
                )}
              </div>
            </div>

            {/* Gallery Images */}
            <div className="space-y-2">
              <Label>Gallery Images ({form.images.length}/20)</Label>
              <div className="flex flex-wrap gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                    <img src={img} alt={`Gallery ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {form.images.length < 20 && (
                  <button type="button" onClick={() => galleryRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors">
                    <Plus className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Add</span>
                  </button>
                )}
                <input ref={galleryRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml" multiple onChange={handleGalleryAdd} className="hidden" />
              </div>
              <p className="text-xs text-muted-foreground">Max 5MB per image (JPEG, PNG, GIF, WebP, SVG).</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {editing ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Delete Project?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This will permanently delete <strong>{deleteConfirm?.title}</strong>.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm?.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsSection;
