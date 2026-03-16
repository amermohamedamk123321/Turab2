import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { projectRequestsApi } from "@/services/api";
import { Trash2, Loader2, Eye, FileText, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const ProjectRequestsSection = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewRequest, setViewRequest] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      setRequests(await projectRequestsApi.list());
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDelete = async (id) => {
    try {
      await projectRequestsApi.delete(id);
      toast({ title: "Project request deleted" });
      setDeleteConfirm(null);
      fetchRequests();
    } catch (e) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const getProjectTypeBadgeColor = (type) => {
    const colors = {
      "website": "bg-blue-500/10 text-blue-700",
      "web app": "bg-purple-500/10 text-purple-700",
      "mobile app": "bg-green-500/10 text-green-700",
      "desktop dashboard system": "bg-orange-500/10 text-orange-700",
      "AI and cyber security updates": "bg-red-500/10 text-red-700",
    };
    return colors[type] || "bg-gray-500/10 text-gray-700";
  };

  const getSecurityBadgeColor = (level) => {
    const colors = {
      "base level security": "bg-yellow-500/10 text-yellow-700",
      "medium level security": "bg-orange-500/10 text-orange-700",
      "high level security": "bg-red-500/10 text-red-700",
    };
    return colors[level] || "bg-gray-500/10 text-gray-700";
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h1 className="text-lg sm:text-2xl font-bold text-foreground">Project Requests Report</h1>
            {requests.length > 0 && <Badge variant="secondary" className="text-[10px] sm:text-xs">{requests.length} total</Badge>}
          </div>
        </div>

        <GlassCard>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No project requests yet.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Project Type</TableHead>
                      <TableHead>Security Level</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-end">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((req) => (
                      <TableRow key={req.id}>
                        <TableCell>
                          <p className="text-sm font-semibold text-foreground">{req.companyName}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getProjectTypeBadgeColor(req.projectType)}`}>
                            {req.projectType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${getSecurityBadgeColor(req.securityLevel)}`}>
                            {req.securityLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{req.email}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-end">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setViewRequest(req)} className="h-8 w-8 p-0">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(req)} className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10">
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
                {requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((req) => (
                  <div key={req.id} className="p-3 rounded-lg border border-border bg-background/50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{req.companyName}</p>
                        <p className="text-xs text-muted-foreground truncate">{req.email}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setViewRequest(req)} className="h-7 w-7 p-0">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(req)} className="h-7 w-7 p-0 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-2">
                      <Badge className={`text-xs ${getProjectTypeBadgeColor(req.projectType)}`}>
                        {req.projectType}
                      </Badge>
                      <Badge className={`text-xs ${getSecurityBadgeColor(req.securityLevel)}`}>
                        {req.securityLevel}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </GlassCard>
      </motion.div>

      {/* View Request Details */}
      <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Project Request Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Company Name</p>
                <p className="text-sm font-semibold">{viewRequest?.companyName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-semibold break-all">{viewRequest?.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone Number</p>
                <p className="text-sm font-semibold">{viewRequest?.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="text-sm font-semibold">{viewRequest && new Date(viewRequest.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Project Type</p>
                <Badge className={`text-xs ${getProjectTypeBadgeColor(viewRequest?.projectType)}`}>
                  {viewRequest?.projectType}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Security Level</p>
                <Badge className={`text-xs ${getSecurityBadgeColor(viewRequest?.securityLevel)}`}>
                  {viewRequest?.securityLevel}
                </Badge>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Custom Features & Details</p>
                <div className="bg-background/50 rounded-md p-3 border border-border">
                  <p className="text-sm whitespace-pre-wrap">{viewRequest?.customFeatures}</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRequest(null)}>Close</Button>
            <Button asChild>
              <a href={`mailto:${viewRequest?.email}`}>Reply via Email</a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Project Request?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Delete project request from <strong>{deleteConfirm?.companyName}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => handleDelete(deleteConfirm?.id)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectRequestsSection;
