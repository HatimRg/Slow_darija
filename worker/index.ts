import nextWorker from 'vinext/server/fetch-handler';
import { handleApiRequest } from './api';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> | Response };
  DB: D1Database;
  IMAGES: unknown;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // If accessing root /darija_learning or /darija_learning/, redirect cleanly to preferred locale
    if (url.pathname === '/darija_learning' || url.pathname === '/darija_learning/') {
      const cookie = request.headers.get('Cookie') || '';
      const match = cookie.match(/NEXT_LOCALE=([a-z]{2})/i);
      const preferred = match && ['en', 'fr', 'ar', 'de', 'tr'].includes(match[1].toLowerCase())
        ? match[1].toLowerCase()
        : 'en';
      return Response.redirect(`${url.origin}/darija_learning/${preferred}${url.search}`, 307);
    }

    const apiResponse = await handleApiRequest(request, env);
    if (apiResponse) return apiResponse;

    return nextWorker.fetch(request, env, ctx);
  },
};

export default worker;
