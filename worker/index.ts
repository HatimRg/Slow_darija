import nextWorker from 'vinext/server/fetch-handler';
import { handleApiRequest } from './api';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> | Response };
  DB: D1Database;
  IMAGES: unknown;
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const apiResponse = await handleApiRequest(request, env);
    if (apiResponse) return apiResponse;

    return nextWorker.fetch(request, env, ctx);
  },
};

export default worker;
