import { Shield, FolderOpen, Mail, LayoutDashboard, LogOut, Share2, Briefcase } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { titleKey: "dashboard.nav.overview", path: "/dashboard", icon: LayoutDashboard },
  { titleKey: "dashboard.nav.security", path: "/dashboard/security", icon: Shield },
  { titleKey: "dashboard.nav.projects", path: "/dashboard/projects", icon: FolderOpen },
  { titleKey: "dashboard.nav.messages", path: "/dashboard/messages", icon: Mail },
  { titleKey: "dashboard.nav.projectRequests", title: "Project Requests", path: "/dashboard/project-requests", icon: Briefcase },
  { titleKey: "dashboard.nav.socialMedia", path: "/dashboard/social-media", icon: Share2 },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { t } = useTranslation();
  const { logout, user } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-e border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
            {!collapsed && (t("dashboard.nav.admin") || "Admin Panel")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.path)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{t(item.titleKey)}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && user && (
          <p className="text-xs text-muted-foreground mb-2 truncate px-1">{user.email}</p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && (t("dashboard.logout") || "Logout")}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
