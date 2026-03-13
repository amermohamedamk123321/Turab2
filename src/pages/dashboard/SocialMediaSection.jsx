import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { socialLinksApi } from "@/services/api";
import { Share2, Plus, Pencil, Trash2, Loader2, Instagram, Facebook, MessageCircle, Youtube, Twitter, Linkedin, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

const PLATFORMS = [
  { value: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { value: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-500" },
  { value: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-500" },
  { value: "youtube", label: "YouTube", icon: Youtube, color: "text-red-500" },
  { value: "twitter", label: "X (Twitter)", icon: Twitter, color: "text-foreground" },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
  { value: "other", label: "Other", icon: Globe, color: "text-muted-foreground" },
];

const getPlatformInfo = (platform) => PLATFORMS.find(p => p.value === platform) || PLATFORMS[PLATFORMS.length - 1];

const SocialMediaSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ platform: "instagram", url: "", enabled: true });

  const fetchLinks = async () => {
    setLoading(true);
    try { setLinks(await socialLinksApi.list()); } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  useEffect(() => { fetchLinks(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ platform: "instagram", url: "", enabled: true });
    setFormOpen(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ platform: item.platform, url: item.url, enabled: item.enabled });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!form.url.trim()) {
      toast({ title: "URL is required", variant: "destructive" });
      return;
    }
    try {
      await socialLinksApi.upsert({ id: editItem?.id, ...form });
      toast({ title: editItem ? "Link updated" : "Link added" });
      setFormOpen(false);
      fetchLinks();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await socialLinksApi.delete(id);
      toast({ title: "Link deleted" });
      setDeleteConfirm(null);
      fetchLinks();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleToggle = async (item) => {
    try {
      await socialLinksApi.upsert({ ...item, enabled: !item.enabled });
      fetchLinks();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Share2 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">{t("dashboard.nav.socialMedia") || "Social Media"}</h1>
          </div>
          <Button onClick={openAdd} size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> <span className="hidden xs:inline">Add</span> Link
          </Button>
        </div>

        <GlassCard className="p-3 sm:p-6">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : links.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Share2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No social media links yet.</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:gap-3">
              {links.map((item) => {
                const info = getPlatformInfo(item.platform);
                const Icon = info.icon;
                return (
                  <div key={item.id} className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg border border-border transition-colors ${item.enabled ? "bg-background" : "bg-muted/50 opacity-60"}`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 ${info.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground">{info.label}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.url}</p>
                    </div>
                    <Switch checked={item.enabled} onCheckedChange={() => handleToggle(item)} />
                    <div className="hidden xs:flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-8 w-8 p-0">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(item)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="xs:hidden flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-7 w-7 p-0">
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(item)} className="h-7 w-7 p-0 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Social Link" : "Add Social Link"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Platform</Label>
              <Select value={form.platform} onValueChange={(v) => setForm(f => ({ ...f, platform: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="flex items-center gap-2">
                        <p.icon className={`h-4 w-4 ${p.color}`} />
                        {p.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={form.url}
                onChange={(e) => setForm(f => ({ ...f, url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.enabled} onCheckedChange={(v) => setForm(f => ({ ...f, enabled: v }))} />
              <Label>Enabled (visible in footer)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editItem ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Delete Link?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Remove <strong>{getPlatformInfo(deleteConfirm?.platform).label}</strong> link?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm?.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SocialMediaSection;
