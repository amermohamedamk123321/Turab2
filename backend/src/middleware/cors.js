/**
 * CORS configuration for production and development
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Get allowed origins from environment variable
    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
      : [
          'http://localhost:3000',
          'http://localhost:5173', // Vite dev server
          'http://127.0.0.1:3000',
          'http://127.0.0.1:5173',
        ];

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Allow credentials (cookies, authorization headers)
  optionsSuccessStatus: 200, // For legacy browsers
  maxAge: 86400, // Cache preflight for 24 hours
};
