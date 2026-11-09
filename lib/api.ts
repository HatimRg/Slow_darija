export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/darija';

export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_PATH}${cleanEndpoint}`;
}