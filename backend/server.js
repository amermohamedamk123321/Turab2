import dotenv from 'dotenv';
import app from './src/app.js';

// Load environment variables from .env file
dotenv.config();

/**
 * Validate required environment variables on startup
 */
const validateEnvironment = () => {
  const requiredVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];

  // In production, ensure secrets are not default/placeholder values
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
      console.error('📋 Required variables:');
      console.error('  - JWT_SECRET (strong random string)');
      console.error('  - JWT_REFRESH_SECRET (strong random string)');
      process.exit(1);
    }
  } else {
    // In development, just warn if using default values
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

// Validate environment before starting
validateEnvironment();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
