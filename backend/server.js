import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

// Verify JWT_SECRET is loaded
console.log('🔐 [DEBUG] JWT_SECRET loaded:', process.env.JWT_SECRET ? '✅ YES' : '❌ NO');
console.log('🔐 [DEBUG] NODE_ENV:', process.env.NODE_ENV);

import app from './src/app.js';

/**
 * Validate required environment variables on startup
 */
const validateEnvironment = () => {
  const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

  if (process.env.NODE_ENV === 'production') {
    const missing = requiredVars.filter(
      varName => !process.env[varName] || process.env[varName].startsWith('your_')
    );

    if (missing.length > 0) {
      console.error(
        '❌ FATAL: Missing or invalid environment variables:',
        missing.join(', ')
      );
      console.error(
        '⚠️  Please set these variables in .env file before starting the server'
      );
      process.exit(1);
    }
  } else {
    const defaultSecrets = requiredVars.filter(
      varName => !process.env[varName] || process.env[varName].startsWith('your_')
    );

    if (defaultSecrets.length > 0) {
      console.warn(
        '⚠️  WARNING: Using default/placeholder JWT secrets in development'
      );
    }
  }

  console.log('✅ Environment validation passed');
};

validateEnvironment();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
