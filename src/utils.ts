import { ReleaseChannel } from "./constants";
import type { BuildResponse, BuildRow, EnvVariables } from "./types";

export function getReleaseChannelRoleId(
	channel: ReleaseChannel,
	env: EnvVariables,
): string {
	switch (channel) {
		case ReleaseChannel.Canary:
			return env.CANARY_ROLE_ID;
		case ReleaseChannel.Ptb:
			return env.PTB_ROLE_ID;
		case ReleaseChannel.Stable:
			return env.STABLE_ROLE_ID;
	}
}

export function getReleaseChannelWebhookUrl(
	channel: ReleaseChannel,
	env: EnvVariables,
): string {
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

export function getFormattedAppEndpoint(
	channel: ReleaseChannel,
	env: EnvVariables,
): string {
	if (env.DEVELOPMENT !== "true") {
		return `${env.DISCORD_APP_PROXY_ENDPOINT}/${channel}`;
	}
	switch (channel) {
		case ReleaseChannel.Canary:
			return "https://canary.discord.com";
		case ReleaseChannel.Ptb:
			return "https://ptb.discord.com";
		case ReleaseChannel.Stable:
			return "https://discord.com";
	}
}
