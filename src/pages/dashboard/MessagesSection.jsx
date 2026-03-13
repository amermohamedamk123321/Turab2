import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { messagesApi } from "@/services/api";
import { Mail, Trash2, Loader2, Eye, MailOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const MessagesSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMsg, setViewMsg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    try { setMessages(await messagesApi.list()); } catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleView = async (msg) => {
    if (!msg.read) {
      await messagesApi.markRead(msg.id);
      fetchMessages();
    }
    setViewMsg(msg);
  };

  const handleDelete = async (id) => {
    try { await messagesApi.delete(id); toast({ title: "Message deleted" }); setDeleteConfirm(null); fetchMessages(); }
    catch (e) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">{t("dashboard.nav.messages") || "Messages"}</h1>
            {unreadCount > 0 && <Badge variant="destructive" className="text-[10px] sm:text-xs">{unreadCount} new</Badge>}
          </div>
        </div>

        <GlassCard>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No messages yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-end">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((msg) => (
                      <TableRow key={msg.id} className={!msg.read ? "bg-primary/5" : ""}>
                        <TableCell>
                          {msg.read ? <MailOpen className="h-4 w-4 text-muted-foreground" /> : <Mail className="h-4 w-4 text-primary" />}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className={`text-sm ${!msg.read ? "font-semibold text-foreground" : "text-foreground"}`}>{msg.name}</p>
                            <p className="text-xs text-muted-foreground">{msg.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className={!msg.read ? "font-medium" : "text-muted-foreground"}>{msg.subject}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(msg.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(msg)} className="h-8 w-8 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(msg)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile card list */}
              <div className="md:hidden space-y-3">
                {messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((msg) => (
                  <div key={msg.id} className={`p-3 rounded-lg border border-border ${!msg.read ? "bg-primary/5" : ""}`}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {msg.read ? <MailOpen className="h-4 w-4 shrink-0 text-muted-foreground" /> : <Mail className="h-4 w-4 shrink-0 text-primary" />}
                        <div className="min-w-0">
                          <p className={`text-sm truncate ${!msg.read ? "font-semibold" : ""}`}>{msg.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleView(msg)} className="h-7 w-7 p-0"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(msg)} className="h-7 w-7 p-0 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                    <p className={`text-sm truncate ${!msg.read ? "font-medium" : "text-muted-foreground"}`}>{msg.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </motion.div>

      {/* View Message */}
      <Dialog open={!!viewMsg} onOpenChange={() => setViewMsg(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{viewMsg?.subject}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">From: <strong className="text-foreground">{viewMsg?.name}</strong></span>
              <span className="text-muted-foreground">{viewMsg && new Date(viewMsg.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-muted-foreground">{viewMsg?.email}</p>
            <div className="border-t border-border pt-3">
              <p className="text-foreground whitespace-pre-wrap">{viewMsg?.message}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewMsg(null)}>Close</Button>
            <Button variant="outline" asChild>
              <a href={`mailto:${viewMsg?.email}`}>Reply via Email</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-destructive">Delete Message?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Delete message from <strong>{deleteConfirm?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm?.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesSection;
