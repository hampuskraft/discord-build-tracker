import {IRequestStrict, error, json} from 'itty-router';
import {z} from 'zod';
import {ReleaseChannel} from './constants';
import {BuildRow, Env} from './types';
import {getBuildResponse} from './utils';

export async function handleStats(_request: IRequestStrict, env: Env): Promise<Response> {
  return json({
    total: await env.DB.prepare('select count(*) as count from builds').first('count'),
    stable: await env.DB.prepare('select count(*) as count from builds where channel=?')
      .bind(ReleaseChannel.STABLE)
      .first('count'),
    ptb: await env.DB.prepare('select count(*) as count from builds where channel=?')
      .bind(ReleaseChannel.PTB)
      .first('count'),
    canary: await env.DB.prepare('select count(*) as count from builds where channel=?')
      .bind(ReleaseChannel.CANARY)
      .first('count'),
    rollback: await env.DB.prepare('select count(*) as count from builds where rollback=1').first('count'),
  });
}

export async function handleLatestAll(_request: IRequestStrict, env: Env): Promise<Response> {
  const stmt = env.DB.prepare('select * from builds where channel=? order by timestamp desc limit 1');
  const canary = await stmt.bind(ReleaseChannel.CANARY).first<BuildRow>();
  const ptb = await stmt.bind(ReleaseChannel.PTB).first<BuildRow>();
  const stable = await stmt.bind(ReleaseChannel.STABLE).first<BuildRow>();
  return json({
    canary: canary ? getBuildResponse(canary) : null,
    ptb: ptb ? getBuildResponse(ptb) : null,
    stable: stable ? getBuildResponse(stable) : null,
  });
}

const handleLatestPathSchema = z.object({
  type: z.nativeEnum(ReleaseChannel),
});

export async function handleLatest(request: IRequestStrict, env: Env): Promise<Response> {
  const params = handleLatestPathSchema.parse(request.params);
  const stmt = env.DB.prepare('select * from builds where channel=? order by timestamp desc limit 1');
  const result = await stmt.bind(params.type).first<BuildRow>();
  if (!result) {
    return error(404, 'No builds found');
  }
  return json(getBuildResponse(result));
}

const handleSearchQuerySchema = z.object({
  type: z.nativeEnum(ReleaseChannel).optional(),
  before: z.preprocess(Number, z.number().positive().int()).optional(),
  after: z.preprocess(Number, z.number().positive().int()).optional(),
  limit: z.preprocess(Number, z.number().int().positive().max(1000)).default(100),
  rollback: z
    .enum(['true', 'false'])
    .transform((value) => (value === 'true' ? 1 : 0))
    .optional(),
});

export async function handleSearch(request: IRequestStrict, env: Env): Promise<Response> {
  const params = handleSearchQuerySchema.parse(request.query);
  const stmt = env.DB.prepare(
    [
      'select * from builds',
      params.type ? 'where channel=?' : '',
      params.before ? 'and timestamp<?' : '',
      params.after ? `${params.before ? 'and' : 'where'} timestamp>?` : '',
      params.rollback !== undefined ? `${params.before || params.after ? 'and' : 'where'} rollback=?` : '',
      'order by timestamp desc limit ?',
    ]
      .filter((part) => part)
      .join(' '),
  );
  const args = [params.type, params.before, params.after, params.rollback, params.limit].filter((arg) => {
    return arg !== undefined;
  });
  const result = await stmt.bind(...args).all<BuildRow>();
  return json(result.results.map(getBuildResponse));
}
