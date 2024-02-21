import {ReleaseChannel} from './constants';
import {BuildResponse, BuildRow, Env} from './types';

export function getReleaseChannelRoleId(channel: ReleaseChannel, env: Env): string {
  switch (channel) {
    case ReleaseChannel.Canary:
      return env.CANARY_ROLE_ID;
    case ReleaseChannel.Ptb:
      return env.PTB_ROLE_ID;
    case ReleaseChannel.Stable:
      return env.STABLE_ROLE_ID;
  }
}

export function getReleaseChannelWebhookUrl(channel: ReleaseChannel, env: Env): string {
  switch (channel) {
    case ReleaseChannel.Canary:
      return env.CANARY_WEBHOOK_URL;
    case ReleaseChannel.Ptb:
      return env.PTB_WEBHOOK_URL;
    case ReleaseChannel.Stable:
      return env.STABLE_WEBHOOK_URL;
  }
}

export function getBuildResponse(row: BuildRow): BuildResponse {
  return {
    channel: row.channel,
    build_number: row.build_number,
    version_hash: row.version_hash,
    timestamp: row.timestamp,
    rollback: row.rollback ? true : undefined,
  };
}
