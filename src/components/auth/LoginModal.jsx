import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginSchema, validateForm } from "@/lib/validation";

export const LoginModal = ({ open, onOpenChange }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    const { success, data, errors } = validateForm(loginSchema, { email, password });
    if (!success) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await login(data.email, data.password);
      toast({ title: t("login.successTitle"), description: t("login.successDesc") });
      onOpenChange(false);
      setEmail("");
      setPassword("");
      setFieldErrors({});
      navigate("/dashboard");
    } catch (error) {
      toast({ title: t("login.errorTitle"), description: t("login.errorDesc"), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 bg-transparent border-0 [&>button]:text-foreground">
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md -z-10" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
          <GlassCard variant="modal" className="w-full bg-card/95 backdrop-blur-xl border border-border">
            <DialogHeader className="space-y-4 text-center">
              <DialogTitle className="text-2xl font-bold hero-gradient">{t("login.title")}</DialogTitle>
              <p className="text-muted-foreground">{t("login.subtitle")}</p>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-6" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">{t("login.email")}</Label>
                <Input id="email" type="email" placeholder="admin@turabroot.com" value={email} onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors(p => ({ ...p, email: undefined })); }} maxLength={255} className={`bg-background/50 border-border text-foreground placeholder:text-muted-foreground ${fieldErrors.email ? "ring-2 ring-destructive" : ""}`} />
                {fieldErrors.email && <p className="text-xs text-destructive">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">{t("login.password")}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors(p => ({ ...p, password: undefined })); }} maxLength={128} className={`bg-background/50 border-border text-foreground placeholder:text-muted-foreground pe-10 ${fieldErrors.password ? "ring-2 ring-destructive" : ""}`} />
                  <Button type="button" variant="ghost" size="sm" className="absolute end-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {fieldErrors.password && <p className="text-xs text-destructive">{fieldErrors.password}</p>}
              </div>
              <p className="text-xs text-muted-foreground text-center">{t("login.defaultCreds") || "Default: admin@turabroot.com / admin123"}</p>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 border-border text-foreground hover:bg-muted">{t("login.cancel")}</Button>
                <Button type="submit" disabled={isLoading} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isLoading ? (<><Loader2 className="me-2 h-4 w-4 animate-spin" />{t("login.signingIn")}</>) : t("login.signIn")}
                </Button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
