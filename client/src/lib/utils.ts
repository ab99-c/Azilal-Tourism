import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Is the current host a static mirror without the Manus backend (e.g. Vercel)?
 * The API endpoints live only on Manus hosts, so anything else is treated as
 * static — queries there must render fallback content instead of crashing.
 */
export const isStaticHost = () =>
  typeof location !== "undefined" &&
  !/manus\.space|manus\.computer|manusvm\.com|localhost/.test(location.host);
