import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useTranslation } from "react-i18next";

const DashboardLayout = ({ children }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'fa';

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full ${isRTL ? 'flex-row-reverse' : ''}`}>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-12 sm:h-14 flex items-center border-b border-border bg-background/80 backdrop-blur-sm px-3 sm:px-4 sticky top-0 z-30">
            <SidebarTrigger className="me-2 sm:me-3" />
            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">Turab Root Admin</span>
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 bg-background overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
