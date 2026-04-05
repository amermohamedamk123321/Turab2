import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const ContactInfo = () => {
  const { t } = useTranslation();

  const contactInfo = [
    { icon: Phone, label: t("contact.info.phone"), value: "+93 767 101 001", href: "tel:+93767101001", action: t("contact.info.callNow") },
    { icon: Phone, label: t("contact.info.mobile"), value: "+93 792 502 101", href: "tel:+93792502101", action: t("contact.info.callMobile") },
    { icon: Mail, label: t("contact.info.emailLabel"), value: "hello@turabroot.com", href: "mailto:hello@turabroot.com", action: t("contact.info.sendEmail") }
  ];

  const handleMapClick = () => {
    window.open("https://maps.google.com/?q=123+Tech+Street,+San+Francisco,+CA", "_blank");
  };

  return (
    <div className="space-y-6">
      {contactInfo.map((info, index) => (
        <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} viewport={{ once: true }}>
          <GlassCard hover className="group cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors"><info.icon className="h-5 w-5 text-primary" /></div>
                <div>
                  <div className="text-sm text-muted-foreground">{info.label}</div>
                  <div className="font-semibold">{info.value}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => window.open(info.href, "_blank")} className="opacity-0 group-hover:opacity-100 transition-opacity">{info.action}</Button>
            </div>
          </GlassCard>
        </motion.div>
      ))}

      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} viewport={{ once: true }}>
        <GlassCard hover className="group cursor-pointer" onClick={handleMapClick}>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors"><MapPin className="h-5 w-5 text-primary" /></div>
              <div>
                <div className="text-sm text-muted-foreground">{t("contact.info.office")}</div>
                <div className="font-semibold">123 Tech Street</div>
                <div className="text-sm text-muted-foreground">San Francisco, CA 94105</div>
              </div>
            </div>
            <div className="h-32 bg-gradient-to-br from-primary/5 to-ring/5 rounded-2xl relative overflow-hidden group-hover:from-primary/10 group-hover:to-ring/10 transition-colors">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center"><MapPin className="h-8 w-8 text-primary mx-auto mb-2" /><div className="text-sm font-medium">{t("contact.info.clickToOpenMap")}</div></div>
              </div>
              <div className="absolute top-4 end-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 bg-primary/10 backdrop-blur-sm rounded-full flex items-center justify-center"><ExternalLink className="h-4 w-4 text-primary" /></div>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-full group-hover:bg-primary/5">
              <ExternalLink className="me-2 h-4 w-4" />{t("contact.info.openFullMap")}
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }} viewport={{ once: true }}>
        <GlassCard>
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />{t("contact.info.businessHours")}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{t("contact.info.monFri")}</span><span className="font-medium">{t("contact.info.monFriHours")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("contact.info.saturday")}</span><span className="font-medium">{t("contact.info.satHours")}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{t("contact.info.sunday")}</span><span className="font-medium">{t("contact.info.closed")}</span></div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default ContactInfo;
