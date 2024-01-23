export const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0';
export const SCRIP_TAG_REGEX = /<script\s+src="(.*?)"/g;
export const BUILD_INFO_REGEX =
  /Build Number: "\)\.concat\("(?<build_number>\d+)",(.+)Version Hash: "\)\.concat\("(?<version_hash>[\dA-Za-z]+)"/;

export enum ReleaseChannel {
  CANARY = 'canary',
  PTB = 'ptb',
  STABLE = 'stable',
}

export const ReleaseChannelToString: Record<ReleaseChannel, string> = {
  [ReleaseChannel.CANARY]: 'Canary',
  [ReleaseChannel.PTB]: 'PTB',
  [ReleaseChannel.STABLE]: 'Stable',
};
