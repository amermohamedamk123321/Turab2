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
import { projectRequestsApi } from "@/services/api";
import { projectRequestSchema, validateForm } from "@/lib/validation";

const ProjectRequestForm = () => {
  const [formData, setFormData] = useState({
    projectType: "",
    securityLevel: "",
    customFeatures: "",
    companyName: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { toast } = useToast();
  const { t } = useTranslation();

  const projectTypes = [
    { key: "website", label: t("projectRequest.projectTypes.website") },
    { key: "web app", label: t("projectRequest.projectTypes.webApp") },
    { key: "mobile app", label: t("projectRequest.projectTypes.mobileApp") },
    { key: "desktop dashboard system", label: t("projectRequest.projectTypes.desktopDashboard") },
    { key: "AI and cyber security updates", label: t("projectRequest.projectTypes.aiCybersecurity") }
  ];
  const securityLevels = [
    { key: "base level security", label: t("projectRequest.securityLevels.base") },
    { key: "medium level security", label: t("projectRequest.securityLevels.medium") },
    { key: "high level security", label: t("projectRequest.securityLevels.high") }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const { success, data, errors } = validateForm(projectRequestSchema, formData);
    if (!success) {
      setFieldErrors(errors);
      toast({ title: t("projectRequest.validationError"), description: Object.values(errors)[0], variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await projectRequestsApi.create(data);
      toast({ title: t("projectRequest.successTitle"), description: t("projectRequest.successDesc") });
      setFormData({
        projectType: "",
        securityLevel: "",
        customFeatures: "",
        companyName: "",
        email: "",
        phone: "",
      });
      setFieldErrors({});
    } catch (error) {
      toast({ title: t("projectRequest.errorTitle"), description: error.message || t("projectRequest.errorDesc"), variant: "destructive" });
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
          {t("projectRequest.title")} <span className="hero-gradient">{t("projectRequest.titleHighlight")}</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Project Type */}
            <div className="space-y-2">
              <Label htmlFor="projectType">{t("projectRequest.projectType")}</Label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background/50 border border-none rounded-md shadow-sm shadow-ring/10 focus:shadow-ring/20 focus:outline-none focus:ring-2 focus:ring-primary ${fieldErrors.projectType ? "ring-2 ring-destructive" : ""}`}
              >
                <option value="">{t("projectRequest.selectProjectType")}</option>
                {projectTypes.map(type => (
                  <option key={type.key} value={type.key}>{type.label}</option>
                ))}
              </select>
              {fieldErrors.projectType && <p className="text-xs text-destructive">{fieldErrors.projectType}</p>}
            </div>

            {/* Security Level */}
            <div className="space-y-2">
              <Label htmlFor="securityLevel">{t("projectRequest.securityLevel")}</Label>
              <select
                id="securityLevel"
                name="securityLevel"
                value={formData.securityLevel}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background/50 border border-none rounded-md shadow-sm shadow-ring/10 focus:shadow-ring/20 focus:outline-none focus:ring-2 focus:ring-primary ${fieldErrors.securityLevel ? "ring-2 ring-destructive" : ""}`}
              >
                <option value="">{t("projectRequest.selectSecurityLevel")}</option>
                {securityLevels.map(level => (
                  <option key={level.key} value={level.key}>{level.label}</option>
                ))}
              </select>
              {fieldErrors.securityLevel && <p className="text-xs text-destructive">{fieldErrors.securityLevel}</p>}
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">{t("projectRequest.companyName")}</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder={t("projectRequest.companyNamePlaceholder")}
              maxLength={100}
              className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 ${fieldErrors.companyName ? "ring-2 ring-destructive" : ""}`}
            />
            {fieldErrors.companyName && <p className="text-xs text-destructive">{fieldErrors.companyName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("projectRequest.email")}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t("projectRequest.emailPlaceholder")}
              maxLength={255}
              className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 ${fieldErrors.email ? "ring-2 ring-destructive" : ""}`}
            />
            {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">{t("projectRequest.phone")}</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("projectRequest.phonePlaceholder")}
              maxLength={20}
              className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 ${fieldErrors.phone ? "ring-2 ring-destructive" : ""}`}
            />
            {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
          </div>

          {/* Custom Features */}
          <div className="space-y-2">
            <Label htmlFor="customFeatures">{t("projectRequest.customFeatures")}</Label>
            <Textarea
              id="customFeatures"
              name="customFeatures"
              value={formData.customFeatures}
              onChange={handleChange}
              placeholder={t("projectRequest.customFeaturesPlaceholder")}
              maxLength={2000}
              rows={6}
              className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 resize-none ${fieldErrors.customFeatures ? "ring-2 ring-destructive" : ""}`}
            />
            {fieldErrors.customFeatures && <p className="text-xs text-destructive">{fieldErrors.customFeatures}</p>}
            <p className="text-xs text-muted-foreground text-end">{formData.customFeatures.length}/2000</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full group bg-primary hover:bg-primary/90 rounded-full" size="lg">
            {isLoading ? (<><Loader2 className="me-2 h-5 w-5 animate-spin" />{t("projectRequest.submitting")}</>) : (<><Send className="me-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />{t("projectRequest.submitButton")}</>)}
          </Button>
          <div className="text-center text-sm text-muted-foreground" aria-live="polite"><p>{t("projectRequest.reviewNote")}</p></div>
        </form>
      </GlassCard>
    </motion.div>
  );
};

export default ProjectRequestForm;
