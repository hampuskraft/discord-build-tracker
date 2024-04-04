import {error, json} from 'itty-router';
import {z} from 'zod';
import {ReleaseChannel} from './constants';
import {router} from './router';
import type {Env} from './types';
import {handleBuildUpdate} from './updates';

export default {
  async fetch(request, env, ctx) {
    return router
      .handle(request, env, ctx)
      .then(json)
      .catch((err: Error) => {
        if (err instanceof z.ZodError) {
          return error(400, err.errors.map((error) => error.message).join('\n'));
        }
        return error(500, err.message);
      });
  },

  async scheduled(_event, env, _ctx) {
    await handleBuildUpdate(ReleaseChannel.Canary, env);
    await handleBuildUpdate(ReleaseChannel.Ptb, env);
    await handleBuildUpdate(ReleaseChannel.Stable, env);
  },
} satisfies ExportedHandler<Env>;
