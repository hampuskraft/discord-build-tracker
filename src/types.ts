import type { ReleaseChannel } from "./constants";

export type EnvVariables = {
	// If set to `true`, we'll ignore the `DISCORD_APP_PROXY_ENDPOINT` and use
	// Discord's domains directly.
	DEVELOPMENT?: string;

	// Discord blocks Cloudflare Workers from accessing app assets, so a proxy
	// running on a cloud VM is required. The server must accept and properly
	// route `GET /{releaseChannel}/{...path}` requests.
	DISCORD_APP_PROXY_ENDPOINT: string;

	CANARY_ROLE_ID: string;
	CANARY_WEBHOOK_URL: string;

	PTB_ROLE_ID: string;
	PTB_WEBHOOK_URL: string;

	STABLE_ROLE_ID: string;
	STABLE_WEBHOOK_URL: string;
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
