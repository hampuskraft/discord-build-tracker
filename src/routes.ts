import {IRequestStrict, error, json} from 'itty-router';
import {ReleaseChannel} from './constants';
import {handleLatestPathSchema, handleSearchQuerySchema} from './schemas';
import {BuildRow, Env} from './types';
import {getBuildResponse} from './utils';

export async function handleStats(_request: IRequestStrict, env: Env): Promise<Response> {
  return json({
    total: await env.DB.prepare('SELECT COUNT(*) AS count FROM builds').first('count'),
    stable: await env.DB.prepare('SELECT COUNT(*) AS count FROM builds WHERE channel = ?')
      .bind(ReleaseChannel.Stable)
      .first('count'),
    ptb: await env.DB.prepare('SELECT COUNT(*) AS count FROM builds WHERE channel = ?')
      .bind(ReleaseChannel.Ptb)
      .first('count'),
    canary: await env.DB.prepare('SELECT COUNT(*) AS count FROM builds WHERE channel = ?')
      .bind(ReleaseChannel.Canary)
      .first('count'),
    rollback: await env.DB.prepare('SELECT COUNT(*) AS count FROM builds WHERE rollback = 1').first('count'),
  });
}

export async function handleLatestAll(_request: IRequestStrict, env: Env): Promise<Response> {
  const stmt = env.DB.prepare('SELECT * FROM builds WHERE channel = ? ORDER BY timestamp DESC LIMIT 1');
  const canary = await stmt.bind(ReleaseChannel.Canary).first<BuildRow>();
  const ptb = await stmt.bind(ReleaseChannel.Ptb).first<BuildRow>();
  const stable = await stmt.bind(ReleaseChannel.Stable).first<BuildRow>();
  return json({
    canary: canary ? getBuildResponse(canary) : null,
    ptb: ptb ? getBuildResponse(ptb) : null,
    stable: stable ? getBuildResponse(stable) : null,
  });
}

export async function handleLatest(request: IRequestStrict, env: Env): Promise<Response> {
  const params = handleLatestPathSchema.parse(request.params);
  const stmt = env.DB.prepare('SELECT * FROM builds WHERE channel = ? ORDER BY timestamp DESC LIMIT 1');
  const result = await stmt.bind(params.type).first<BuildRow>();
  if (!result) {
    return error(404, 'No builds found');
  }
  return json(getBuildResponse(result));
}

export async function handleSearch(request: IRequestStrict, env: Env): Promise<Response> {
  const params = handleSearchQuerySchema.parse(request.query);
  const stmt = env.DB.prepare(
    [
      'SELECT * FROM builds',
      params.type || params.before || params.after || params.rollback !== undefined ? 'WHERE 1 = 1' : '',
      params.type ? 'AND channel = ?' : '',
      params.before ? 'AND timestamp < ?' : '',
      params.after ? 'AND timestamp > ?' : '',
      params.rollback !== undefined ? 'AND rollback = ?' : '',
      'ORDER BY timestamp DESC LIMIT ?',
    ]
      .filter((part) => part)
      .join(' '),
  );
  const args = [params.type, params.before, params.after, params.rollback, params.limit].filter(
    (arg) => arg !== undefined,
  );
  const result = await stmt.bind(...args).all<BuildRow>();
  return json(result.results.map(getBuildResponse));
}
