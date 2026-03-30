/**
 * HTTP API Service Layer
 * Connects to Express.js backend with fallback to localStorage
 * All functions return promises
 */
import { contactSchema, loginSchema, adminCreateSchema, adminUpdateSchema, projectSchema, projectRequestSchema } from "@/lib/validation";

// Get API base URL from environment
// For local development: use relative path (proxied through Vite)
// For production: use absolute URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Track if we're in fallback mode (backend not available)
let USE_FALLBACK = false;
let FALLBACK_CHECKED = false;

// Storage key for tokens
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'turab_access_token',
  REFRESH_TOKEN: 'turab_refresh_token',
  PROJECTS: 'turab_fallback_projects',
  MESSAGES: 'turab_fallback_messages',
  PROJECT_REQUESTS: 'turab_fallback_requests',
};

/**
 * Fallback storage functions for when backend is unavailable
 */
const FallbackStorage = {
  getProjects: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return stored ? JSON.parse(stored) : [];
  },
  setProjects: (projects) => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  },
  getMessages: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return stored ? JSON.parse(stored) : [];
  },
  addMessage: (message) => {
    const messages = FallbackStorage.getMessages();
    messages.push({ ...message, id: Date.now() });
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    return message;
  },
  getProjectRequests: () => {
    const stored = localStorage.getItem(STORAGE_KEYS.PROJECT_REQUESTS);
    return stored ? JSON.parse(stored) : [];
  },
  addProjectRequest: (request) => {
    const requests = FallbackStorage.getProjectRequests();
    requests.push({ ...request, id: Date.now() });
    localStorage.setItem(STORAGE_KEYS.PROJECT_REQUESTS, JSON.stringify(requests));
    return request;
  },
};

/**
 * Seed fallback data on first load
 */
const seedFallbackData = () => {
  if (FallbackStorage.getProjects().length === 0) {
    const sampleProjects = [
      {
        id: 1,
        title: "Enterprise Analytics Dashboard",
        description: "A comprehensive analytics platform that transforms complex data into actionable insights for enterprise clients.",
        category: "Web",
        status: "completed",
        isWebsite: true,
        url: "https://example.com/dashboard",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        techTags: ["React", "TypeScript", "D3.js", "Node.js", "PostgreSQL"],
        metric: "300% increase in user engagement",
        challenge: "The client needed a way to visualize massive amounts of data from multiple sources in real-time.",
        solution: "We developed a modular dashboard system with customizable widgets and real-time data streaming.",
        result: "300% increase in user engagement, 40% reduction in time-to-insight.",
        featured: true,
      },
      {
        id: 2,
        title: "E-Commerce Transformation",
        description: "Modern shopping experience with AI-powered recommendations and seamless checkout process.",
        category: "Web",
        status: "completed",
        isWebsite: true,
        url: "https://example.com/shop",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        techTags: ["Next.js", "Stripe", "PostgreSQL", "Redis", "AWS"],
        metric: "150% boost in conversion rates",
        featured: true,
      },
      {
        id: 3,
        title: "Social Mobile App",
        description: "Cross-platform mobile application connecting users through shared interests and real-time interactions.",
        category: "Mobile",
        status: "completed",
        isWebsite: false,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        techTags: ["React Native", "GraphQL", "AWS", "Firebase", "Socket.io"],
        metric: "1M+ downloads in first year",
        featured: true,
      },
    ];
    FallbackStorage.setProjects(sampleProjects);
  }
};

// Seed fallback data on module load
seedFallbackData();

/**
 * Check if backend is available (runs once)
 */
const checkBackendAvailability = async () => {
  if (FALLBACK_CHECKED) return USE_FALLBACK;

  FALLBACK_CHECKED = true;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (response.ok) {
      USE_FALLBACK = false;
      console.log('Backend is available');
      return false;
    }
  } catch (error) {
    console.warn('Backend not available, using fallback mode:', error.message);
  }

  USE_FALLBACK = true;
  console.warn('Switched to fallback mode - backend not accessible');
  return true;
};

/**
 * Make HTTP request with automatic fallback to localStorage
 */
const apiRequest = async (endpoint, options = {}) => {
  // Check backend availability
  if (!FALLBACK_CHECKED) {
    await checkBackendAvailability();
  }

  // If backend is not available, throw error (will be handled by individual APIs)
  if (USE_FALLBACK) {
    throw new Error('BACKEND_UNAVAILABLE');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth token if available
  const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // Handle 401 - token expired, try to refresh
    if (response.status === 401 && accessToken) {
      const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
      if (refreshToken) {
        try {
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);

            // Retry original request with new token
            headers['Authorization'] = `Bearer ${data.data.accessToken}`;
            return fetch(url, {
              ...options,
              headers,
            }).then(res => handleResponse(res));
          } else {
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Token refresh failed:', error);
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          window.location.href = '/';
        }
      }
    }

    return handleResponse(response);
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Handle API response
 */
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const message = data.message || `HTTP Error: ${response.status}`;
    throw new Error(message);
  }

  return data;
};

// ===== AUTH API =====
export const authApi = {
  login: async (email, password) => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || "Invalid input");

    try {
      console.log('🔐 Attempting login for:', email);
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      console.log('✅ Login successful');

      // Store tokens
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.data.accessToken);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.data.refreshToken);

      return response.data.admin;
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      throw error;
    }
  },

  logout: async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    try {
      await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }

    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getSession: () => {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return null;

    try {
      // Decode token to get user info (without verification)
      const parts = accessToken.split('.');
      if (parts.length !== 3) return null;

      const decoded = JSON.parse(atob(parts[1]));
      return {
        id: decoded.id,
        email: decoded.email,
      };
    } catch {
      return null;
    }
  },
};

// ===== PROJECTS API =====
export const projectsApi = {
  list: async () => {
    try {
      const response = await apiRequest('/projects');
      // Cache successful response
      if (response.data) {
        FallbackStorage.setProjects(response.data);
      }
      return response.data;
    } catch (error) {
      if (error.message === 'BACKEND_UNAVAILABLE') {
        console.warn('Backend unavailable, using cached projects');
        return FallbackStorage.getProjects();
      }
      throw error;
    }
  },

  create: async (project) => {
    // Map frontend field names to backend field names
    const data = {
      title: project.title,
      description: project.description,
      status: project.status,
      url: project.url,
      video_url: project.videoUrl,
      category: project.category,
      is_website: project.isWebsite,
      tech_tags: project.techTags,
      featured: project.featured,
      challenge: project.challenge,
      solution: project.solution,
      result: project.result,
      metric: project.metric,
    };

    const response = await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Map backend response to frontend format
    return mapProjectResponse(response.data);
  },

  update: async (id, data) => {
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.url !== undefined) updateData.url = data.url;
    if (data.videoUrl !== undefined) updateData.video_url = data.videoUrl;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isWebsite !== undefined) updateData.is_website = data.isWebsite;
    if (data.techTags !== undefined) updateData.tech_tags = data.techTags;
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.challenge !== undefined) updateData.challenge = data.challenge;
    if (data.solution !== undefined) updateData.solution = data.solution;
    if (data.result !== undefined) updateData.result = data.result;
    if (data.metric !== undefined) updateData.metric = data.metric;

    const response = await apiRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    return mapProjectResponse(response.data);
  },

  delete: async (id) => {
    await apiRequest(`/projects/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

/**
 * Map backend project format to frontend format
 */
const mapProjectResponse = (project) => {
  return {
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    url: project.url,
    videoUrl: project.video_url,
    thumbnail: project.thumbnail_url,
    category: project.category,
    isWebsite: project.is_website,
    techTags: project.tech_tags ? JSON.parse(typeof project.tech_tags === 'string' ? project.tech_tags : JSON.stringify(project.tech_tags)) : [],
    featured: project.featured,
    challenge: project.challenge,
    solution: project.solution,
    result: project.result,
    metric: project.metric,
    createdAt: project.created_at,
    images: [], // Gallery images not used with YouTube thumbnails
  };
};

// ===== MESSAGES API =====
export const messagesApi = {
  list: async () => {
    const response = await apiRequest('/messages');
    return response.data;
  },

  create: async ({ name, email, subject, message }) => {
    const parsed = contactSchema.safeParse({ name, email, subject, message });
    if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || "Invalid input");
    const sanitized = parsed.data;

    const response = await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({
        name: sanitized.name,
        email: sanitized.email,
        subject: sanitized.subject,
        message: sanitized.message,
      }),
    });

    return response.data;
  },

  markRead: async (id) => {
    const response = await apiRequest(`/messages/${id}/read`, {
      method: 'PATCH',
    });
    return response.data;
  },

  delete: async (id) => {
    await apiRequest(`/messages/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

// ===== ADMIN USERS API =====
export const adminsApi = {
  list: async () => {
    const response = await apiRequest('/admins');
    return response.data;
  },

  create: async ({ username, email, password }) => {
    const parsed = adminCreateSchema.safeParse({ username, email, password });
    if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || "Invalid input");

    const response = await apiRequest('/admins', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    return response.data;
  },

  update: async (id, { username, email, password }) => {
    const data = {};
    if (username !== undefined) data.username = username;
    if (email !== undefined) data.email = email;
    if (password !== undefined) data.password = password;

    const response = await apiRequest(`/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    return response.data;
  },

  delete: async (id) => {
    await apiRequest(`/admins/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

// ===== SOCIAL LINKS API =====
export const socialLinksApi = {
  list: async () => {
    const response = await apiRequest('/social-links');
    return response.data;
  },

  upsert: async ({ id, platform, url, enabled = true }) => {
    if (id) {
      // Update existing
      const response = await apiRequest(`/social-links/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ platform, url, enabled }),
      });
      return response.data;
    } else {
      // Create new
      const response = await apiRequest('/social-links', {
        method: 'POST',
        body: JSON.stringify({ platform, url, enabled }),
      });
      return response.data;
    }
  },

  delete: async (id) => {
    await apiRequest(`/social-links/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};

// ===== PROJECT REQUESTS API =====
export const projectRequestsApi = {
  list: async () => {
    const response = await apiRequest('/project-requests');
    return response.data;
  },

  create: async (data) => {
    const parsed = projectRequestSchema.safeParse(data);
    if (!parsed.success) throw new Error(parsed.error.errors[0]?.message || "Invalid input");
    const sanitized = parsed.data;

    const response = await apiRequest('/project-requests', {
      method: 'POST',
      body: JSON.stringify({
        project_type: sanitized.projectType,
        security_level: sanitized.securityLevel,
        custom_features: sanitized.customFeatures,
        company_name: sanitized.companyName,
        email: sanitized.email,
        phone: sanitized.phone,
      }),
    });

    return response.data;
  },

  getById: async (id) => {
    const response = await apiRequest(`/project-requests/${id}`);
    return response.data;
  },

  delete: async (id) => {
    await apiRequest(`/project-requests/${id}`, {
      method: 'DELETE',
    });
    return true;
  },
};
