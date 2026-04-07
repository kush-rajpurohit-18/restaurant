const isProduction = process.env.NODE_ENV === 'production';

function getPublicEnv(name: 'NEXT_PUBLIC_API_URL' | 'NEXT_PUBLIC_WS_URL', fallback: string) {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (!isProduction) {
    return fallback;
  }

  throw new Error(`Missing required public environment variable: ${name}`);
}

export const publicEnv = {
  apiUrl: getPublicEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001/api'),
  wsUrl: getPublicEnv('NEXT_PUBLIC_WS_URL', 'http://localhost:3001'),
};
