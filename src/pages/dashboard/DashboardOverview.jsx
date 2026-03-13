import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { FolderOpen, Users, Mail, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { adminsApi, projectsApi, messagesApi } from "@/services/api";

const DashboardOverview = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ admins: 0, projects: 0, messages: 0, unread: 0 });

  useEffect(() => {
    Promise.all([adminsApi.list(), projectsApi.list(), messagesApi.list()]).then(([admins, projects, messages]) => {
      setStats({
        admins: admins.length,
        projects: projects.length,
        messages: messages.length,
        unread: messages.filter(m => !m.read).length,
      });
    });
  }, []);

  const cards = [
    { label: t("dashboard.totalProjects"), value: stats.projects, icon: FolderOpen, color: "text-primary" },
    { label: t("dashboard.nav.security"), value: stats.admins, icon: Shield, color: "text-chart-1" },
    { label: t("dashboard.nav.messages"), value: stats.messages, icon: Mail, color: "text-chart-2" },
    { label: t("dashboard.unreadMessages") || "Unread", value: stats.unread, icon: Users, color: "text-destructive" },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
          {t("dashboard.title")} <span className="hero-gradient">{t("dashboard.titleHighlight")}</span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">{t("dashboard.welcome")}</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {cards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GlassCard hover className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
              <div className="p-2 sm:p-3 rounded-xl bg-primary/10">
                <card.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{card.label}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;
