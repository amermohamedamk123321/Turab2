import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Moon, Sun, User, Globe, Menu, X } from "lucide-react";
import { LoginModal } from "@/components/auth/LoginModal";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import logo from "@/assets/turab-root-logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOverHero, setIsOverHero] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      // On home page, consider "over hero" when within the viewport height
      if (location.pathname === "/") {
        setIsOverHero(window.scrollY < window.innerHeight - 100);
      } else {
        setIsOverHero(false);
      }
    };
    handleScroll(); // run on mount
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.projects"), path: "/projects" },
    { name: t("nav.about"), path: "/about" },
    { name: t("nav.contact"), path: "/contact" }
  ];

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === "en" ? "fa" : "en");

  // Dynamic color classes based on context
  const textColor = isOverHero ? "text-white" : "text-foreground";
  const textMuted = isOverHero ? "text-white/50" : "text-foreground/50";
  const textHover = isOverHero ? "hover:text-white/80" : "hover:text-foreground/80";
  const textFull = isOverHero ? "hover:text-white" : "hover:text-foreground";
  const activeBg = isOverHero ? "bg-white/[0.08]" : "bg-foreground/[0.08]";
  const hoverBg = isOverHero ? "hover:bg-white/[0.04]" : "hover:bg-foreground/[0.04]";
  const btnHoverBg = isOverHero ? "hover:bg-white/[0.06]" : "hover:bg-foreground/[0.06]";
  const glassBg = isOverHero
    ? "bg-white/[0.06] border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    : "bg-background/80 border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:bg-white/[0.06] dark:border-white/[0.1] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]";

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div
          className={`mt-4 mx-4 w-full max-w-5xl transition-all duration-300 ${
            isScrolled ? "mt-2" : "mt-4"
          }`}
        >
          <div className={`relative backdrop-blur-2xl border rounded-full px-5 sm:px-6 py-2.5 transition-all duration-300 ${glassBg}`}>
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link
                to="/"
                className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
                aria-label="Turab Root Home"
              >
                <img src={logo} alt="Turab Root Logo" className="h-8 sm:h-9 w-auto" />
                <span className={`text-base sm:text-lg font-bold transition-colors duration-300 ${textColor}`}>
                  Turab Root
                </span>
              </Link>

              {/* Center Navigation */}
              <nav className="hidden md:flex items-center gap-1" role="navigation">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`relative text-sm font-medium transition-all duration-300 px-4 py-2 rounded-lg ${
                      location.pathname === item.path
                        ? `${textColor} ${activeBg}`
                        : `${textMuted} ${textHover} ${hoverBg}`
                    }`}
                    aria-current={location.pathname === item.path ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleLanguage}
                  className={`rounded-lg h-8 px-2.5 text-xs font-semibold gap-1 transition-all duration-300 ${textMuted} ${textFull} ${btnHoverBg}`}
                  aria-label="Toggle language"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{i18n.language === "en" ? "FA" : "EN"}</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className={`rounded-lg w-8 h-8 p-0 transition-all duration-300 ${textMuted} ${textFull} ${btnHoverBg}`}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  <AnimatePresence mode="wait">
                    {theme === "dark" ? (
                      <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Sun className="h-3.5 w-3.5" />
                      </motion.div>
                    ) : (
                      <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                        <Moon className="h-3.5 w-3.5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLogin(true)}
                  className={`rounded-lg w-8 h-8 p-0 transition-all duration-300 ${textMuted} ${textFull} ${btnHoverBg}`}
                  aria-label="Admin login"
                >
                  <User className="h-3.5 w-3.5" />
                </Button>

                {/* Mobile menu toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className={`rounded-lg w-8 h-8 p-0 md:hidden transition-all duration-300 ${textMuted} ${textFull} ${btnHoverBg}`}
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait">
                    {mobileOpen ? (
                      <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <X className="h-4 w-4" />
                      </motion.div>
                    ) : (
                      <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Menu className="h-4 w-4" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.nav
              className={`fixed top-[80px] left-4 right-4 z-50 md:hidden backdrop-blur-2xl border rounded-2xl overflow-hidden transition-all duration-300 ${
                isOverHero
                  ? "bg-white/[0.06] border-white/[0.1] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
                  : "bg-background/80 border-border/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:bg-white/[0.06] dark:border-white/[0.1] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
              }`}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              role="navigation"
            >
              <div className="p-3 space-y-1">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        location.pathname === item.path
                          ? `${activeBg} ${textColor}`
                          : `${textMuted} ${hoverBg} ${textHover}`
                      }`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <LoginModal open={showLogin} onOpenChange={setShowLogin} />
    </>
  );
};

export default Header;
