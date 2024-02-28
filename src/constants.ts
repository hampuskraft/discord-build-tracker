export const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0';
export const SCRIP_TAG_REGEX = /<script\s+src="(.*?)"/g;
export const BUILD_INFO_REGEX = /Build Number: (?<build_number>\d+)/;

export enum ReleaseChannel {
  Canary = 'canary',
  Ptb = 'ptb',
  Stable = 'stable',
}

export const ReleaseChannelToString: Record<ReleaseChannel, string> = {
  [ReleaseChannel.Canary]: 'Canary',
  [ReleaseChannel.Ptb]: 'PTB',
  [ReleaseChannel.Stable]: 'Stable',
};
