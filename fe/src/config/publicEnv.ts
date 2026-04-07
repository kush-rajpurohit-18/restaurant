const isProduction = process.env.NODE_ENV === 'production';

function readPublicEnv(name: 'NEXT_PUBLIC_API_URL' | 'NEXT_PUBLIC_WS_URL', fallback: string) {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (!isProduction) {
    return fallback;
  }

  return '';
}

export const publicEnv = {
  apiUrl: readPublicEnv('NEXT_PUBLIC_API_URL', 'http://localhost:3001/api'),
  wsUrl: readPublicEnv('NEXT_PUBLIC_WS_URL', 'http://localhost:3001'),
};

export function assertPublicEnv(name: 'NEXT_PUBLIC_API_URL' | 'NEXT_PUBLIC_WS_URL', value: string) {
  if (!value && typeof window !== 'undefined') {
    throw new Error(`Missing required public environment variable: ${name}`);
  }
}
