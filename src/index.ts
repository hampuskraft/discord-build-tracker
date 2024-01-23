import {error, json} from 'itty-router';
import {z} from 'zod';
import {ReleaseChannel} from './constants';
import {router} from './router';
import type {Env} from './types';
import {handleBuildUpdate} from './updates';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    return router
      .handle(request, env, ctx)
      .then(json)
      .catch((err) => {
        if (err instanceof z.ZodError) {
          return error(400, err.errors.map((error) => error.message).join('\n'));
        }
        return error(500, err.message);
      });
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    await handleBuildUpdate(ReleaseChannel.CANARY, env);
    await handleBuildUpdate(ReleaseChannel.PTB, env);
    await handleBuildUpdate(ReleaseChannel.STABLE, env);
  },
};
