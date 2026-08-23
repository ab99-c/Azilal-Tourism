import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Static-mirror mode is opt-in now that the Vercel deployment includes the
 * Serverless API. Set VITE_STATIC_MIRROR=true only for a deliberately static
 * export that must not call the backend.
 */
export const isStaticHost = () => import.meta.env.VITE_STATIC_MIRROR === "true";
