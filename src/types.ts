import {ReleaseChannel} from './constants';

export type Env = {
  ENVIRONMENT: 'production' | 'development';

  // Discord blocks Cloudflare Workers from accessing app assets, so a proxy
  // running on a cloud VM is required. The server must accept and properly
  // route `GET /{releaseChannel}/{...path}` requests.
  DISCORD_APP_PROXY_ENDPOINT: string;
  DISCORD_API_TOKEN: string;

  CANARY_ROLE_ID: string;
  CANARY_WEBHOOK_URL: string;

  PTB_ROLE_ID: string;
  PTB_WEBHOOK_URL: string;

  STABLE_ROLE_ID: string;
  STABLE_WEBHOOK_URL: string;

  DB: D1Database;
};

export type BuildRow = {
  channel: ReleaseChannel;
  build_number: number;
  version_hash: string;
  timestamp: number;
  rollback: number;
};

export type BuildResponse = {
  channel: ReleaseChannel;
  build_number: number;
  version_hash: string;
  timestamp: number;
  rollback?: true;
};
