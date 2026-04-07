const isProduction = process.env.NODE_ENV === "production";
const DEFAULT_API_URL = "https://restaurant-be-tylt.onrender.com/api";
const DEFAULT_WS_URL = "https://restaurant-be-tylt.onrender.com";

function readPublicEnv(
  name: "NEXT_PUBLIC_API_URL" | "NEXT_PUBLIC_WS_URL",
  fallback: string,
) {
  const value = process.env[name];

  if (value) {
    return value;
  }

  if (!isProduction) {
    return fallback;
  }

  return "";
}

export const publicEnv = {
  apiUrl: readPublicEnv("NEXT_PUBLIC_API_URL", DEFAULT_API_URL),
  wsUrl: readPublicEnv("NEXT_PUBLIC_WS_URL", DEFAULT_WS_URL),
};

export function assertPublicEnv(
  name: "NEXT_PUBLIC_API_URL" | "NEXT_PUBLIC_WS_URL",
  value: string,
) {
  if (!value && typeof window !== "undefined") {
    throw new Error(`Missing required public environment variable: ${name}`);
  }
}
