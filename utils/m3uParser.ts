import { Channel } from '@/types/channel';

export function parseM3U(raw: string): Channel[] {
  const lines = raw.trim().split('\n');
  const channels: Channel[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF')) {
      const urlLine = lines[i + 1]?.trim();
      if (!urlLine || urlLine.startsWith('#')) continue;

      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);
      const idMatch = line.match(/tvg-id="([^"]+)"/);

      channels.push({
        id: idMatch?.[1] || `channel-${i}`,
        name: nameMatch?.[1]?.trim() || 'Unknown Channel',
        logo: logoMatch?.[1] || '',
        group: groupMatch?.[1] || 'Other',
        url: urlLine,
      });
    }
  }

  return channels;
}

export function filterSportsChannels(channels: Channel[]): Channel[] {
  const sportsKeywords = [
    'sports', 'sport', 'football', 'soccer', 'basketball',
    'cricket', 'tennis', 'golf', 'fifa', 'espn', 'fox sports',
    'nbc sports', 'nfl', 'nba', 'mlb', 'nhl', 'tsn', 'sky sports',
    'bein', 'eurosp', 'olympic', 'ufc', 'wwe', 'racing', 'motor',
    'boxing', 'wrestling', 'hockey', 'baseball', 'volleyball'
  ];

  return channels.filter(channel => {
    const groupName = channel.group.toLowerCase();
    const channelName = channel.name.toLowerCase();

    return sportsKeywords.some(keyword =>
      groupName.includes(keyword) || channelName.includes(keyword)
    );
  });
}

export function getGroups(channels: Channel[]): string[] {
  const groups = new Set<string>();
  channels.forEach(c => {
    c.group.split(',').forEach(g => groups.add(g.trim()));
  });
  return ['All', ...Array.from(groups).sort()];
}

export function getGroupIcon(group: string): string {
  const iconMap: Record<string, string> = {
    'All': 'Television',
    'Sports': 'Trophy',
    'Football': 'CircleDot',
    'Soccer': 'CircleDot',
    'Basketball': 'Circle',
    'Cricket': 'Target',
    'Tennis': 'Square',
    'News': 'Newspaper',
    'Entertainment': 'Film',
    'Movies': 'Clapperboard',
    'Kids': 'Baby',
    'Music': 'Music',
    'Religious': 'Church',
    'Weather': 'Cloud',
  };

  for (const [key, icon] of Object.entries(iconMap)) {
    if (group.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }

  return 'Radio';
}
