import { z } from "zod";

// --- Sanitization helpers ---
const sanitizeString = (val) =>
  typeof val === "string"
    ? val.replace(/[<>]/g, "").replace(/javascript:/gi, "").replace(/on\w+\s*=/gi, "").trim()
    : val;

const safeString = (min, max, label) =>
  z.string().trim().transform(sanitizeString).pipe(
    z.string().min(min, `${label} is required`).max(max, `${label} must be under ${max} characters`)
  );

const safeOptionalString = (max, label) =>
  z.string().trim().transform(sanitizeString).pipe(
    z.string().max(max, `${label} must be under ${max} characters`)
  ).optional().or(z.literal(""));

// --- Contact Form ---
export const contactSchema = z.object({
  name: safeString(1, 100, "Name"),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  subject: safeOptionalString(200, "Subject"),
  message: safeString(1, 2000, "Message"),
});

// --- Login Form ---
export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(1, "Password is required").max(128, "Password too long"),
});

// --- Admin Create ---
export const adminCreateSchema = z.object({
  username: safeString(1, 50, "Username").pipe(
    z.string().regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, dots, hyphens, and underscores")
  ),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password too long"),
});

// --- Admin Update ---
export const adminUpdateSchema = z.object({
  username: safeString(1, 50, "Username").pipe(
    z.string().regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, dots, hyphens, and underscores")
  ),
  email: z.string().trim().email("Invalid email address").max(255, "Email too long"),
  password: z.string().max(128, "Password too long").optional().or(z.literal("")),
});

// --- Project Form ---
export const projectSchema = z.object({
  title: safeString(1, 200, "Title"),
  description: safeOptionalString(5000, "Description"),
  status: z.enum(["active", "completed", "paused"], { message: "Invalid status" }),
  url: z.string().trim().max(500, "URL too long")
    .refine((val) => !val || /^https?:\/\/.+/.test(val), "URL must start with http:// or https://")
    .optional().or(z.literal("")),
  techTags: z.string().max(500, "Tech tags too long").optional().or(z.literal("")),
  thumbnail: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).max(20, "Max 20 gallery images").optional(),
});

// --- Helper to validate and return errors ---
export const validateForm = (schema, data) => {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data, errors: null };
  const errors = {};
  result.error.errors.forEach((err) => {
    const key = err.path.join(".");
    if (!errors[key]) errors[key] = err.message;
  });
  return { success: false, data: null, errors };
};
