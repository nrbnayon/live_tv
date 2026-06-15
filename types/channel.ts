export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

export interface PlayerState {
  volume: number;
  muted: boolean;
  isPlaying: boolean;
  isBuffering: boolean;
  error: string | null;
}

export interface StreamHealth {
  channelId: string;
  lastCheck: number;
  isHealthy: boolean;
  bufferingCount: number;
  latency: number;
}
