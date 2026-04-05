import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { GlassCard } from "@/components/ui/glass-card";
import { Instagram, Facebook, MessageCircle, Phone, Mail, MapPin, Clock, ArrowRight, Youtube, Twitter, Linkedin, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import logo from "@/assets/turab-root-logo.png";

const PLATFORM_META = {
  instagram: { icon: Instagram, color: "hover:text-pink-500" },
  facebook: { icon: Facebook, color: "hover:text-blue-500" },
  whatsapp: { icon: MessageCircle, color: "hover:text-green-500" },
  youtube: { icon: Youtube, color: "hover:text-red-500" },
  twitter: { icon: Twitter, color: "hover:text-foreground" },
  linkedin: { icon: Linkedin, color: "hover:text-blue-600" },
  other: { icon: Globe, color: "hover:text-muted-foreground" },
};

const Footer = () => {
  const { t } = useTranslation();
  const [socialLinks, setSocialLinks] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("turab_social_links") || "[]");
      setSocialLinks(stored.filter(l => l.enabled));
    } catch { setSocialLinks([]); }
  }, []);

  const navItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.projects"), path: "/projects" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" }
  ];

  const serviceLinks = [
    { name: t("services.security.title"), path: "/projects" },
    { name: t("services.software.title"), path: "/projects" },
    { name: t("services.web.title"), path: "/projects" }
  ];

  return (
    <footer className="relative mt-20">
      <div className="container mx-auto px-4 pb-8">
        <GlassCard variant="footer" className="p-8 md:p-12">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            
            {/* Left Column - Quick Links & Services */}
            <div className="space-y-8 order-2 md:order-1">
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Quick Links</h4>
                <nav className="flex flex-col gap-3" role="navigation" aria-label="Footer navigation">
                  {navItems.map((item, index) => (
                    <motion.div key={item.path} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}>
                      <Link to={item.path} className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 group">
                        <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {item.name}
                      </Link>
                    </motion.div>
                  ))}
                </nav>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Services</h4>
                <nav className="flex flex-col gap-3">
                  {serviceLinks.map((item, index) => (
                    <Link key={index} to={item.path} className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center gap-2 group">
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            {/* Center Column - Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center text-center order-1 md:order-2"
            >
              <img src={logo} alt="Turab Root Logo" className="h-32 w-auto mb-3 drop-shadow-lg" />
              <span className="text-2xl font-bold hero-gradient">Turab Root</span>
              <span className="text-sm text-muted-foreground mt-1">{t("footer.ictService")}</span>
              <p className="text-xs text-foreground/50 mt-4 max-w-[240px] leading-relaxed">
                Transforming visions into digital reality. Your trusted partner for innovative technology solutions.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3 mt-5">
                {socialLinks.map((social) => {
                  const meta = PLATFORM_META[social.platform] || PLATFORM_META.other;
                  const Icon = meta.icon;
                  return (
                    <motion.a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors ${meta.color}`}
                      aria-label={`Visit our ${social.platform} page`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon className="h-5 w-5" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>

            {/* Right Column - Contact Info & Hours */}
            <div className="space-y-8 order-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">Contact</h4>
                <div className="flex flex-col gap-3">
                  <a href="tel:+93767101001" className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center gap-2.5" dir="ltr">
                    <Phone className="h-4 w-4 text-primary/70" />
                    +93 767 101 001
                  </a>
                  <a href="mailto:turabacademy96@gmail.com" className="text-sm text-foreground/60 hover:text-primary transition-colors flex items-center gap-2.5" dir="ltr">
                    <Mail className="h-4 w-4 text-primary/70" />
                    turabacademy96@gmail.com
                  </a>
                  <span className="text-sm text-foreground/60 flex items-center gap-2.5">
                    <MapPin className="h-4 w-4 text-primary/70" />
                    Kabul, Afghanistan
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-foreground/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-foreground/40">
              © {new Date().getFullYear()} Turab Root. {t("footer.allRightsReserved")}
            </p>
            <div className="flex items-center gap-6 text-xs text-foreground/40">
              <span className="hover:text-foreground/60 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="hover:text-foreground/60 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </footer>
  );
};

export default Footer;
