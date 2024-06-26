import {BUILD_INFO_REGEX, type ReleaseChannel, ReleaseChannelToString, SCRIPT_TAG_REGEX, USER_AGENT} from './constants';
import type {BuildRow, EnvVariables} from './types';
import {getFormattedAppEndpoint, getReleaseChannelRoleId, getReleaseChannelWebhookUrl} from './utils';

export async function handleBuildUpdate(
	releaseChannel: ReleaseChannel,
	env: EnvVariables & {DB: D1Database},
): Promise<void> {
	const getBuildStmt = env.DB.prepare('SELECT * FROM builds WHERE channel = ? ORDER BY timestamp DESC LIMIT 1');
	const prevBuild = await getBuildStmt.bind(releaseChannel).first<BuildRow>();
	const versionHash = await getVersionHash(releaseChannel, env);
	if (prevBuild && versionHash === prevBuild.version_hash) {
		return;
	}

	const buildNumber = await getBuildNumber(releaseChannel, env);
	if (prevBuild && buildNumber === prevBuild.build_number) {
		return;
	}

	let description: string | undefined;
	let rollback = false;
	if (prevBuild && buildNumber < prevBuild.build_number) {
		description = `Build number went backwards from ${prevBuild.build_number} to ${buildNumber}`;
		rollback = true;
	}

	const embed = {
		title: `New ${ReleaseChannelToString[releaseChannel]} Update`,
		description,
		fields: [
			{
				name: 'Build Number',
				value: buildNumber,
				inline: true,
			},
			{
				name: 'Version Hash (Short)',
				value: versionHash.slice(0, 7),
				inline: true,
			},
			{
				name: 'Version Hash',
				value: versionHash,
			},
		],
	};

	await fetch(getReleaseChannelWebhookUrl(releaseChannel, env), {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			content: `<@&${getReleaseChannelRoleId(releaseChannel, env)}>`,
			embeds: [embed],
		}),
	});

	const insertStmt = env.DB.prepare(
		'INSERT INTO builds (channel, build_number, version_hash, timestamp, rollback) VALUES (?, ?, ?, ?, ?)',
	);
	await insertStmt.bind(releaseChannel, buildNumber, versionHash, Date.now(), rollback ? 1 : 0).run();
}

async function getVersionHash(releaseChannel: ReleaseChannel, env: EnvVariables): Promise<string> {
	const response = await fetch(`${getFormattedAppEndpoint(releaseChannel, env)}/app`, {
		headers: {'User-Agent': USER_AGENT},
	});
	const buildId = response.headers.get('X-Build-Id');
	if (!buildId) {
		throw new Error('No build ID found');
	}
	return buildId;
}

async function getBuildNumber(releaseChannel: ReleaseChannel, env: EnvVariables): Promise<number> {
	const response = await fetch(`${getFormattedAppEndpoint(releaseChannel, env)}/app`, {
		headers: {'User-Agent': USER_AGENT},
	});
	const html = await response.text();
	const srcValues = [];
	let matches = SCRIPT_TAG_REGEX.exec(html);
	while (matches !== null) {
		srcValues.unshift(matches[1]);
		matches = SCRIPT_TAG_REGEX.exec(html);
	}
	for (const value of srcValues) {
		const response = await fetch(`${getFormattedAppEndpoint(releaseChannel, env)}/${value}`, {
			headers: {'User-Agent': USER_AGENT},
		});
		const js = await response.text();
		const match = js.match(BUILD_INFO_REGEX);
		if (match?.groups) {
			return Number(match.groups.build_number);
		}
	}
	throw new Error('No build info found');
}
