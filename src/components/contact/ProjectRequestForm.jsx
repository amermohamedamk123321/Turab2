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

  const projectTypes = ["website", "web app", "mobile app", "desktop dashboard system", "AI and cyber security updates"];
  const securityLevels = ["base level security", "medium level security", "high level security"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const { success, data, errors } = validateForm(projectRequestSchema, formData);
    if (!success) {
      setFieldErrors(errors);
      toast({ title: "Validation Error", description: Object.values(errors)[0], variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await projectRequestsApi.create(data);
      toast({ title: "Success", description: "Your project request has been submitted successfully!" });
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
      toast({ title: "Error", description: error.message || "Failed to submit project request", variant: "destructive" });
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
          Project <span className="hero-gradient">Request</span>
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Project Type */}
            <div className="space-y-2">
              <Label htmlFor="projectType">Project Type *</Label>
              <select
                id="projectType"
                name="projectType"
                value={formData.projectType}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background/50 border border-none rounded-md shadow-sm shadow-ring/10 focus:shadow-ring/20 focus:outline-none focus:ring-2 focus:ring-primary ${fieldErrors.projectType ? "ring-2 ring-destructive" : ""}`}
              >
                <option value="">Select a project type</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {fieldErrors.projectType && <p className="text-xs text-destructive">{fieldErrors.projectType}</p>}
            </div>

            {/* Security Level */}
            <div className="space-y-2">
              <Label htmlFor="securityLevel">Security Level *</Label>
              <select
                id="securityLevel"
                name="securityLevel"
                value={formData.securityLevel}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background/50 border border-none rounded-md shadow-sm shadow-ring/10 focus:shadow-ring/20 focus:outline-none focus:ring-2 focus:ring-primary ${fieldErrors.securityLevel ? "ring-2 ring-destructive" : ""}`}
              >
                <option value="">Select a security level</option>
                {securityLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              {fieldErrors.securityLevel && <p className="text-xs text-destructive">{fieldErrors.securityLevel}</p>}
            </div>
          </div>

          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter your company name"
              maxLength={100}
              className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 ${fieldErrors.companyName ? "ring-2 ring-destructive" : ""}`}
            />
            {fieldErrors.companyName && <p className="text-xs text-destructive">{fieldErrors.companyName}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
              maxLength={255}
              className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 ${fieldErrors.email ? "ring-2 ring-destructive" : ""}`}
            />
            {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              maxLength={20}
              className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 ${fieldErrors.phone ? "ring-2 ring-destructive" : ""}`}
            />
            {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
          </div>

          {/* Custom Features */}
          <div className="space-y-2">
            <Label htmlFor="customFeatures">Custom Features & Details *</Label>
            <Textarea
              id="customFeatures"
              name="customFeatures"
              value={formData.customFeatures}
              onChange={handleChange}
              placeholder="Describe the custom features and details you want for your project"
              maxLength={2000}
              rows={6}
              className={`bg-background/50 border-none shadow-sm shadow-ring/10 focus:shadow-ring/20 resize-none ${fieldErrors.customFeatures ? "ring-2 ring-destructive" : ""}`}
            />
            {fieldErrors.customFeatures && <p className="text-xs text-destructive">{fieldErrors.customFeatures}</p>}
            <p className="text-xs text-muted-foreground text-end">{formData.customFeatures.length}/2000</p>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isLoading} className="w-full group bg-primary hover:bg-primary/90 rounded-full" size="lg">
            {isLoading ? (<><Loader2 className="me-2 h-5 w-5 animate-spin" />Submitting...</>) : (<><Send className="me-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />Submit Request</>)}
          </Button>
          <div className="text-center text-sm text-muted-foreground" aria-live="polite"><p>We will review your request and get back to you soon.</p></div>
        </form>
      </GlassCard>
    </motion.div>
  );
};

export default ProjectRequestForm;
