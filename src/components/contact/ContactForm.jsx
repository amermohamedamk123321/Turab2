import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { messagesApi } from "@/services/api";
import { contactSchema, validateForm } from "@/lib/validation";

const ContactForm = ({ prefillSubject }) => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: prefillSubject || "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const { success, data, errors } = validateForm(contactSchema, formData);
    if (!success) {
      setFieldErrors(errors);
      toast({ title: t("contact.form.errorTitle"), description: Object.values(errors)[0], variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await messagesApi.create(data);
      toast({ title: t("contact.form.successTitle"), description: t("contact.form.successDesc") });
      setFormData({ name: "", email: "", subject: "", message: "" });
      setFieldErrors({});
    } catch (error) {
      toast({ title: t("contact.form.errorTitle"), description: t("contact.form.errorDesc"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: undefined }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
      <GlassCard className="p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("contact.form.title")} <span className="hero-gradient">{t("contact.form.titleHighlight")}</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t("contact.form.name")} *</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder={t("contact.form.namePlaceholder")} maxLength={100} className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 ${fieldErrors.name ? "ring-2 ring-destructive" : ""}`} />
              {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("contact.form.email")} *</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder={t("contact.form.emailPlaceholder")} maxLength={255} className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 ${fieldErrors.email ? "ring-2 ring-destructive" : ""}`} />
              {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">{t("contact.form.subject")}</Label>
            <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} placeholder={t("contact.form.subjectPlaceholder")} maxLength={200} className="bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">{t("contact.form.message")} *</Label>
            <Textarea id="message" name="message" value={formData.message} onChange={handleChange} placeholder={t("contact.form.messagePlaceholder")} maxLength={2000} rows={6} className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 resize-none ${fieldErrors.message ? "ring-2 ring-destructive" : ""}`} />
            {fieldErrors.message && <p className="text-xs text-destructive">{fieldErrors.message}</p>}
            <p className="text-xs text-muted-foreground text-end">{formData.message.length}/2000</p>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full group bg-primary hover:bg-primary/90 rounded-full" size="lg">
            {isLoading ? (<><Loader2 className="me-2 h-5 w-5 animate-spin" />{t("contact.form.sending")}</>) : (<><Send className="me-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />{t("contact.form.send")}</>)}
          </Button>
          <div className="text-center text-sm text-muted-foreground" aria-live="polite"><p>{t("contact.form.responseNote")}</p></div>
        </form>
      </GlassCard>
    </motion.div>
  );
};

export default ContactForm;
