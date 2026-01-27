interface EnvVars {
  NODE_ENV: string;
  PORT: string;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  GEMINI_TEMPERATURE: string;
  GEMINI_MAX_TOKENS: string;
  DB_HOST: string;
  DB_PORT: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GOOGLE_CALLBACK_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  SESSION_SECRET: string;
  CORS_ORIGIN?: string;
}

const validateEnv = (): void => {
  const requiredVars: (keyof EnvVars)[] = [
    'NODE_ENV',
    'PORT',
    'GEMINI_API_KEY',
    'GEMINI_MODEL',
    'GEMINI_TEMPERATURE',
    'GEMINI_MAX_TOKENS',
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_CALLBACK_URL',
    'JWT_SECRET',
    'JWT_EXPIRES_IN',
    'SESSION_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    process.exit(1);
  }

  // Validate specific values
  if (process.env.NODE_ENV && !['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    console.error('❌ Invalid NODE_ENV. Must be: development, production, or test');
    process.exit(1);
  }

  const port = parseInt(process.env.PORT || '5000');
  if (isNaN(port) || port < 1 || port > 65535) {
    console.error('❌ Invalid PORT. Must be a valid port number (1-65535)');
    process.exit(1);
  }

  const dbPort = parseInt(process.env.DB_PORT || '3306');
  if (isNaN(dbPort) || dbPort < 1 || dbPort > 65535) {
    console.error('❌ Invalid DB_PORT. Must be a valid port number (1-65535)');
    process.exit(1);
  }

  console.log('✅ Environment variables validated successfully');
};

export { validateEnv };
export type { EnvVars };
