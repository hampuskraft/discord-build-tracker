import {BUILD_INFO_REGEX, ReleaseChannel, ReleaseChannelToString, SCRIP_TAG_REGEX, USER_AGENT} from './constants';
import {BuildRow, Env} from './types';
import {getReleaseChannelRoleId, getReleaseChannelWebhookUrl} from './utils';

export async function handleBuildUpdate(releaseChannel: ReleaseChannel, env: Env): Promise<void> {
  const newBuildInfo = await getBuildInfo(releaseChannel, env);
  const getBuildInfoStmt = env.DB.prepare('select * from builds where channel=? order by timestamp desc limit 1');
  const oldBuildInfo = await getBuildInfoStmt.bind(releaseChannel).first<BuildRow>();
  if (oldBuildInfo && newBuildInfo.build_number === oldBuildInfo.build_number) {
    return;
  }

  let description: string | undefined;
  let rollback = false;
  if (oldBuildInfo && newBuildInfo.build_number < oldBuildInfo.build_number) {
    description = `Build number went backwards from ${oldBuildInfo.build_number} to ${newBuildInfo.build_number}`;
    rollback = true;
  }

  const embed = {
    title: `New ${ReleaseChannelToString[releaseChannel]} Update`,
    description,
    fields: [
      {
        name: 'Build Number',
        value: newBuildInfo.build_number,
        inline: true,
      },
      {
        name: 'Version Hash (Short)',
        value: newBuildInfo.version_hash.slice(0, 7),
        inline: true,
      },
      {
        name: 'Version Hash',
        value: newBuildInfo.version_hash,
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
    'insert into builds (channel, build_number, version_hash, timestamp, rollback) values (?, ?, ?, ?, ?)',
  );
  await insertStmt
    .bind(releaseChannel, newBuildInfo.build_number, newBuildInfo.version_hash, Date.now(), rollback ? 1 : 0)
    .run();
}

type BuildInfo = {
  build_number: number;
  version_hash: string;
};

async function getBuildInfo(releaseChannel: ReleaseChannel, env: Env): Promise<BuildInfo> {
  const response = await fetch(`${env.DISCORD_APP_PROXY_ENDPOINT}/${releaseChannel}/app`, {
    headers: {'User-Agent': USER_AGENT},
  });
  const html = await response.text();
  let matches;
  let srcValues = [];
  while ((matches = SCRIP_TAG_REGEX.exec(html)) !== null) {
    srcValues.unshift(matches[1]);
  }
  for (const value of srcValues) {
    const response = await fetch(`${env.DISCORD_APP_PROXY_ENDPOINT}/${releaseChannel}/${value}`, {
      headers: {'User-Agent': USER_AGENT},
    });
    const js = await response.text();
    const match = js.match(BUILD_INFO_REGEX);
    if (match?.groups) {
      return {
        build_number: Number(match.groups.build_number),
        version_hash: match.groups.version_hash,
      };
    }
  }
  throw new Error('No build info found');
}
