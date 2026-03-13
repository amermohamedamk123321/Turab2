/**
 * Mock API Service Layer
 * Replace these functions with real API calls to your VPS backend.
 * All functions return promises to match real API behavior.
 */
import { contactSchema, loginSchema, adminCreateSchema, adminUpdateSchema, projectSchema } from "@/lib/validation";

const STORAGE_KEYS = {
  ADMINS: 'turab_admins',
  PROJECTS: 'turab_admin_projects',
  MESSAGES: 'turab_admin_messages',
  AUTH: 'turab_auth_token',
  SOCIAL_LINKS: 'turab_social_links',
};

// --- Helpers ---
const getStore = (key, fallback = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch { return fallback; }
};
const setStore = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Hash password (simple mock — replace with bcrypt on real backend)
const hashPassword = async (pw) => {
  const enc = new TextEncoder().encode(pw + 'turab-salt-2024');
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Seed default admin if none exist
const seedAdmins = async () => {
  const admins = getStore(STORAGE_KEYS.ADMINS);
  if (admins.length === 0) {
    const hashed = await hashPassword('admin123');
    setStore(STORAGE_KEYS.ADMINS, [
      { id: crypto.randomUUID(), username: 'admin', email: 'admin@turabroot.com', passwordHash: hashed, createdAt: new Date().toISOString() }
    ]);
  }
};
seedAdmins();

// Seed sample projects
const seedProjects = () => {
  const projects = getStore(STORAGE_KEYS.PROJECTS);
  if (projects.length === 0) {
    setStore(STORAGE_KEYS.PROJECTS, [
      {
        id: crypto.randomUUID(),
        title: "Enterprise Analytics Dashboard",
        description: "A comprehensive analytics platform that transforms complex data into actionable insights for enterprise clients.",
        category: "Web",
        status: "completed",
        isWebsite: true,
        url: "https://example.com/dashboard",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "/placeholder.svg",
        images: [],
        techTags: ["React", "TypeScript", "D3.js", "Node.js", "PostgreSQL"],
        metric: "300% increase in user engagement",
        challenge: "The client needed a way to visualize massive amounts of data from multiple sources in real-time.",
        solution: "We developed a modular dashboard system with customizable widgets and real-time data streaming.",
        result: "300% increase in user engagement, 40% reduction in time-to-insight.",
        featured: true,
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "E-Commerce Transformation",
        description: "Modern shopping experience with AI-powered recommendations and seamless checkout process.",
        category: "Web",
        status: "completed",
        isWebsite: true,
        url: "https://example.com/shop",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "/placeholder.svg",
        images: [],
        techTags: ["Next.js", "Stripe", "PostgreSQL", "Redis", "AWS"],
        metric: "150% boost in conversion rates",
        challenge: "The existing e-commerce platform had high cart abandonment rates and poor mobile experience.",
        solution: "Complete platform redesign with mobile-first approach and one-click checkout.",
        result: "150% boost in conversion rates, 60% reduction in cart abandonment.",
        featured: true,
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Social Mobile App",
        description: "Cross-platform mobile application connecting users through shared interests and real-time interactions.",
        category: "Mobile",
        status: "completed",
        isWebsite: false,
        url: "",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "/placeholder.svg",
        images: [],
        techTags: ["React Native", "GraphQL", "AWS", "Firebase", "Socket.io"],
        metric: "1M+ downloads in first year",
        challenge: "Creating a seamless real-time social experience across multiple platforms.",
        solution: "Built with React Native for cross-platform compatibility with real-time messaging.",
        result: "1M+ downloads in first year, 85% user retention rate.",
        featured: true,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "FinTech Security Platform",
        description: "Advanced security and compliance platform for financial institutions.",
        category: "Security",
        status: "completed",
        isWebsite: false,
        url: "",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        thumbnail: "/placeholder.svg",
        images: [],
        techTags: ["Python", "Django", "Machine Learning", "Docker", "Kubernetes"],
        metric: "99.9% threat detection accuracy",
        challenge: "Financial institutions needed a comprehensive security solution.",
        solution: "Developed an AI-powered threat detection system with automated compliance reporting.",
        result: "99.9% threat detection accuracy, 80% reduction in false positives.",
        featured: false,
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "Healthcare Management System",
        description: "Comprehensive healthcare management platform improving patient care.",
        category: "Web",
        status: "active",
        isWebsite: true,
        url: "https://example.com/health",
        videoUrl: "",
        thumbnail: "/placeholder.svg",
        images: [],
        techTags: ["Vue.js", "Laravel", "MySQL", "WebRTC", "HIPAA"],
        metric: "50% reduction in administrative overhead",
        challenge: "Healthcare providers needed an integrated solution for patient management.",
        solution: "Created a unified platform with patient portals and video consultations.",
        result: "50% reduction in administrative overhead, 90% patient satisfaction rate.",
        featured: false,
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: crypto.randomUUID(),
        title: "EdTech Learning Platform",
        description: "Interactive learning platform with AI-powered personalization.",
        category: "Web",
        status: "active",
        isWebsite: true,
        url: "https://example.com/learn",
        videoUrl: "",
        thumbnail: "/placeholder.svg",
        images: [],
        techTags: ["Angular", "Spring Boot", "MongoDB", "WebSocket", "Machine Learning"],
        metric: "70% improvement in learning outcomes",
        challenge: "Educational institutions needed a scalable personalized learning platform.",
        solution: "Built an adaptive learning system with AI-powered content recommendations.",
        result: "70% improvement in learning outcomes, adoption by 100+ institutions.",
        featured: false,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }
};
seedProjects();

// Seed sample messages
const seedMessages = () => {
  const msgs = getStore(STORAGE_KEYS.MESSAGES);
  if (msgs.length === 0) {
    setStore(STORAGE_KEYS.MESSAGES, [
      { id: crypto.randomUUID(), name: 'Ahmad Rahimi', email: 'ahmad@example.com', subject: 'Website Redesign', message: 'We need a modern website for our company. Can you help?', read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
      { id: crypto.randomUUID(), name: 'Sara Mohammadi', email: 'sara@example.com', subject: 'Mobile App Development', message: 'Looking for a team to build our iOS and Android app.', read: false, createdAt: new Date(Date.now() - 172800000).toISOString() },
      { id: crypto.randomUUID(), name: 'John Smith', email: 'john@example.com', subject: 'Security Audit', message: 'We need a comprehensive security audit for our infrastructure.', read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
    ]);
  }
};
seedMessages();

// Seed default social links (and backfill missing platforms)
const seedSocialLinks = () => {
  const links = getStore(STORAGE_KEYS.SOCIAL_LINKS);
  const defaults = [
    { platform: 'instagram', url: 'https://instagram.com/turabroot' },
    { platform: 'facebook', url: 'https://facebook.com/turabroot' },
    { platform: 'whatsapp', url: 'https://wa.me/1234567890' },
    { platform: 'youtube', url: 'https://youtube.com/@turabroot' },
    { platform: 'twitter', url: 'https://x.com/turabroot' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/turabroot' },
  ];
  const existing = links.map(l => l.platform);
  const missing = defaults.filter(d => !existing.includes(d.platform));
  if (missing.length > 0) {
    const updated = [...links, ...missing.map(d => ({ id: crypto.randomUUID(), ...d, enabled: true }))];
    setStore(STORAGE_KEYS.SOCIAL_LINKS, updated);
  }
};
seedSocialLinks();

// --- AUTH ---
export const authApi = {
  login: async (email, password) => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || "Invalid input");
    await new Promise(r => setTimeout(r, 500));
    const admins = getStore(STORAGE_KEYS.ADMINS);
    const hashed = await hashPassword(password);
    const admin = admins.find(a => a.email === email && a.passwordHash === hashed);
    if (!admin) throw new Error('Invalid credentials');
    const token = btoa(JSON.stringify({ id: admin.id, email: admin.email, ts: Date.now() }));
    localStorage.setItem(STORAGE_KEYS.AUTH, token);
    return { id: admin.id, email: admin.email, username: admin.username };
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  },
  getSession: () => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (!token) return null;
      const data = JSON.parse(atob(token));
      if (Date.now() - data.ts > 86400000) {
        localStorage.removeItem(STORAGE_KEYS.AUTH);
        return null;
      }
      return data;
    } catch { return null; }
  },
};

// --- ADMIN USERS (Security) ---
export const adminsApi = {
  list: async () => {
    await new Promise(r => setTimeout(r, 200));
    return getStore(STORAGE_KEYS.ADMINS).map(({ passwordHash, ...rest }) => rest);
  },
  create: async ({ username, email, password }) => {
    const parsed = adminCreateSchema.safeParse({ username, email, password });
    if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || "Invalid input");
    await new Promise(r => setTimeout(r, 300));
    const admins = getStore(STORAGE_KEYS.ADMINS);
    if (admins.find(a => a.email === email)) throw new Error('Email already exists');
    const hashed = await hashPassword(password);
    const newAdmin = { id: crypto.randomUUID(), username, email, passwordHash: hashed, createdAt: new Date().toISOString() };
    admins.push(newAdmin);
    setStore(STORAGE_KEYS.ADMINS, admins);
    const { passwordHash, ...safe } = newAdmin;
    return safe;
  },
  update: async (id, { username, email, password }) => {
    await new Promise(r => setTimeout(r, 300));
    const admins = getStore(STORAGE_KEYS.ADMINS);
    const idx = admins.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Admin not found');
    if (email && admins.find(a => a.email === email && a.id !== id)) throw new Error('Email already exists');
    if (username) admins[idx].username = username;
    if (email) admins[idx].email = email;
    if (password) admins[idx].passwordHash = await hashPassword(password);
    setStore(STORAGE_KEYS.ADMINS, admins);
    const { passwordHash, ...safe } = admins[idx];
    return safe;
  },
  delete: async (id) => {
    await new Promise(r => setTimeout(r, 300));
    const admins = getStore(STORAGE_KEYS.ADMINS);
    if (admins.length <= 1) throw new Error('Cannot delete the last admin');
    const filtered = admins.filter(a => a.id !== id);
    if (filtered.length === admins.length) throw new Error('Admin not found');
    setStore(STORAGE_KEYS.ADMINS, filtered);
    return true;
  },
};

// --- PROJECTS ---
export const projectsApi = {
  list: async () => {
    await new Promise(r => setTimeout(r, 200));
    return getStore(STORAGE_KEYS.PROJECTS);
  },
  create: async (project) => {
    await new Promise(r => setTimeout(r, 300));
    const projects = getStore(STORAGE_KEYS.PROJECTS);
    const newProject = { id: crypto.randomUUID(), ...project, createdAt: new Date().toISOString() };
    projects.push(newProject);
    setStore(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  },
  update: async (id, data) => {
    await new Promise(r => setTimeout(r, 300));
    const projects = getStore(STORAGE_KEYS.PROJECTS);
    const idx = projects.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    projects[idx] = { ...projects[idx], ...data };
    setStore(STORAGE_KEYS.PROJECTS, projects);
    return projects[idx];
  },
  delete: async (id) => {
    await new Promise(r => setTimeout(r, 300));
    const projects = getStore(STORAGE_KEYS.PROJECTS);
    setStore(STORAGE_KEYS.PROJECTS, projects.filter(p => p.id !== id));
    return true;
  },
};

// --- MESSAGES ---
export const messagesApi = {
  list: async () => {
    await new Promise(r => setTimeout(r, 200));
    return getStore(STORAGE_KEYS.MESSAGES);
  },
  create: async ({ name, email, subject, message }) => {
    const parsed = contactSchema.safeParse({ name, email, subject, message });
    if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || "Invalid input");
    const sanitized = parsed.data;
    await new Promise(r => setTimeout(r, 300));
    const messages = getStore(STORAGE_KEYS.MESSAGES);
    const newMsg = { id: crypto.randomUUID(), name: sanitized.name, email: sanitized.email, subject: sanitized.subject || "", message: sanitized.message, read: false, createdAt: new Date().toISOString() };
    messages.push(newMsg);
    setStore(STORAGE_KEYS.MESSAGES, messages);
    return newMsg;
  },
  markRead: async (id) => {
    await new Promise(r => setTimeout(r, 200));
    const messages = getStore(STORAGE_KEYS.MESSAGES);
    const idx = messages.findIndex(m => m.id === id);
    if (idx !== -1) { messages[idx].read = true; setStore(STORAGE_KEYS.MESSAGES, messages); }
    return messages[idx];
  },
  delete: async (id) => {
    await new Promise(r => setTimeout(r, 200));
    const messages = getStore(STORAGE_KEYS.MESSAGES);
    setStore(STORAGE_KEYS.MESSAGES, messages.filter(m => m.id !== id));
    return true;
  },
};

// --- SOCIAL LINKS ---
export const socialLinksApi = {
  list: async () => {
    await new Promise(r => setTimeout(r, 100));
    return getStore(STORAGE_KEYS.SOCIAL_LINKS);
  },
  upsert: async ({ id, platform, url, enabled = true }) => {
    await new Promise(r => setTimeout(r, 200));
    const links = getStore(STORAGE_KEYS.SOCIAL_LINKS);
    if (id) {
      const idx = links.findIndex(l => l.id === id);
      if (idx === -1) throw new Error('Link not found');
      links[idx] = { ...links[idx], platform, url, enabled };
    } else {
      links.push({ id: crypto.randomUUID(), platform, url, enabled });
    }
    setStore(STORAGE_KEYS.SOCIAL_LINKS, links);
    return links;
  },
  delete: async (id) => {
    await new Promise(r => setTimeout(r, 200));
    const links = getStore(STORAGE_KEYS.SOCIAL_LINKS);
    setStore(STORAGE_KEYS.SOCIAL_LINKS, links.filter(l => l.id !== id));
    return true;
  },
};