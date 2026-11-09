// The GitHub Pages build has no server: no API routes and no secret keys.
export const STATIC_SITE = process.env.NEXT_PUBLIC_STATIC_SITE === "1";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
