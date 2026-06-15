import React, { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Dimensions, Animated, Platform, Modal, ScrollView } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/contexts/SettingsContext';
import { Channel } from '@/types/channel';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Maximize,
  Minimize,
  PictureInPicture2,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Settings,
} from 'lucide-react-native';

interface VideoPlayerProps {
  channel: Channel | null;
  channels: Channel[];
  onChannelSwitch: (channel: Channel) => void;
  autoSwitchOnBuffer: boolean;
  bufferThreshold: number;
}

export interface VideoPlayerRef {
  toggleFullscreen: () => void;
  togglePiP: () => void;
  play: () => void;
  pause: () => void;
}

const NativeVideoWrapper = ({ channel, onPlaying, onPause, onWaiting, onCanPlay, onError, videoViewRef, playerRef, aspectRatio, muted, volume }: any) => {
  const player = useVideoPlayer(channel?.url || '', (player) => {
    player.play();
  });

  useImperativeHandle(playerRef, () => ({
    play: () => player.play(),
    pause: () => player.pause(),
  }));

  useEffect(() => {
    const playSub = player.addListener('playingChange', ({ isPlaying }) => {
      if (isPlaying) onPlaying();
      else onPause();
    });
    const statusSub = player.addListener('statusChange', ({ status }) => {
      if (status === 'loading') onWaiting();
      else if (status === 'readyToPlay') onCanPlay();
      else if (status === 'error') onError();
    });
    return () => { playSub.remove(); statusSub.remove(); };
  }, [player, onPlaying, onPause, onWaiting, onCanPlay, onError]);

  useEffect(() => { player.muted = muted; }, [muted]);
  useEffect(() => { player.volume = volume; }, [volume]);

  return (
    <VideoView
      ref={videoViewRef}
      player={player}
      style={{ width: '100%', height: '100%', backgroundColor: '#000' }}
      fullscreenOptions={{ enable: true, orientation: 'landscape', autoExitOnRotate: false }}
      allowsPictureInPicture
      nativeControls={false}
      contentFit={aspectRatio === '16:9' ? 'contain' : aspectRatio === '4:3' ? 'fill' : 'cover'}
    />
  );
};

const VideoPlayer = forwardRef<VideoPlayerRef, VideoPlayerProps>(({
  channel,
  channels,
  onChannelSwitch,
  autoSwitchOnBuffer,
  bufferThreshold,
}, ref) => {
  const insets = useSafeAreaInsets();
  const settings = useSettings();

  const videoRef = useRef<any>(null);
  const containerRef = useRef<View>(null);
  const nativePlayerRef = useRef<any>(null);
  const videoViewRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bufferingTime, setBufferingTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '21:9'>('16:9');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bufferTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useImperativeHandle(ref, () => ({
    toggleFullscreen: handleFullscreen,
    togglePiP: handlePiP,
    play: togglePlay,
    pause: togglePlay,
  }));

  useEffect(() => {
    if (!channel) return;
    setLoading(true);
    setError(null);
    setBufferingTime(0);
    setIsBuffering(false);
    setIsPlaying(false);

    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.src = channel.url;
      videoRef.current.load();
    }
  }, [channel]);

  useEffect(() => {
    if (isBuffering && autoSwitchOnBuffer && channel) {
      bufferTimerRef.current = setInterval(() => {
        setBufferingTime(prev => {
          const newTime = prev + 100;
          if (newTime >= bufferThreshold) {
            handleAutoSwitch();
            return 0;
          }
          return newTime;
        });
      }, 100);
    } else {
      if (bufferTimerRef.current) {
        clearInterval(bufferTimerRef.current);
        bufferTimerRef.current = null;
      }
      setBufferingTime(0);
    }
    return () => {
      if (bufferTimerRef.current) clearInterval(bufferTimerRef.current);
    };
  }, [isBuffering, autoSwitchOnBuffer, bufferThreshold, channel]);

  const handleAutoSwitch = useCallback(() => {
    if (!channel) return;
    const currentIndex = channels.findIndex(c => c.id === channel.id);
    const nextIndex = (currentIndex + 1) % channels.length;
    const nextChannel = channels[nextIndex];
    if (nextChannel && nextChannel.id !== channel.id) {
      onChannelSwitch(nextChannel);
    }
  }, [channel, channels, onChannelSwitch]);

  const handleWaiting = useCallback(() => setIsBuffering(true), []);
  const handlePlaying = useCallback(() => {
    setIsBuffering(false);
    setLoading(false);
    setError(null);
    setIsPlaying(true);
  }, []);
  const handlePause = useCallback(() => setIsPlaying(false), []);
  const handleError = useCallback(() => {
    setError('Stream unavailable');
    setLoading(false);
    if (autoSwitchOnBuffer) {
      setTimeout(handleAutoSwitch, 1500);
    }
  }, [autoSwitchOnBuffer, handleAutoSwitch]);
  const handleCanPlay = useCallback(() => {
    setLoading(false);
    if (Platform.OS === 'web') {
      videoRef.current?.play().catch(() => { });
    }
  }, []);

  const togglePlay = () => {
    if (Platform.OS === 'web') {
      if (!videoRef.current) return;
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    } else {
      if (!nativePlayerRef.current) return;
      if (isPlaying) nativePlayerRef.current.pause();
      else nativePlayerRef.current.play();
    }
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.muted = newMuted;
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleFullscreen = async () => {
    if (Platform.OS === 'web') {
      const el = videoRef.current;
      if (!el) return;
      try {
        if (!document.fullscreenElement) {
          await el.requestFullscreen?.();
          setIsFullscreen(true);
        } else {
          await document.exitFullscreen?.();
          setIsFullscreen(false);
        }
      } catch (e) {
        console.log('Fullscreen error:', e);
      }
    } else {
      if (!isFullscreen) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);
      }
    }
  };

  const handlePiP = async () => {
    if (Platform.OS === 'web') {
      if (!videoRef.current) return;
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else if (document.pictureInPictureEnabled) {
          await videoRef.current.requestPictureInPicture();
        }
      } catch (e) {
        console.log('PiP error:', e);
      }
    } else {
      videoViewRef.current?.startPictureInPicture();
    }
  };

  const handleRetry = () => {
    if (!channel) return;
    setLoading(true);
    setError(null);
    if (Platform.OS === 'web' && videoRef.current) {
      videoRef.current.src = channel.url;
      videoRef.current.load();
    } else if (Platform.OS !== 'web' && nativePlayerRef.current) {
      nativePlayerRef.current.play();
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const qualityOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'low', label: 'Low (480p)' },
    { value: 'medium', label: 'Medium (720p)' },
    { value: 'high', label: 'High (1080p)' },
    { value: '2k', label: '2K (1440p)' },
    { value: '4k', label: '4K (2160p)' },
    { value: '8k', label: '8K (4320p)' },
  ];

  const renderContent = () => (
    <View
      ref={containerRef}
      style={[styles.container, isFullscreen && Platform.OS === 'web' && styles.containerFullscreen, { paddingTop: Platform.OS !== 'web' && !isFullscreen ? insets.top : 0 }]}
      {...({ onMouseMove: showControlsTemporarily } as any)}
      onTouchStart={showControlsTemporarily}
    >
      {loading && (
        <View style={styles.overlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>Connecting to {channel?.name}...</Text>
          </View>
        </View>
      )}

      {isBuffering && autoSwitchOnBuffer && (
        <View style={styles.bufferingOverlay}>
          <View style={styles.bufferingContent}>
            <ActivityIndicator size="large" color="#fbbf24" />
            <Text style={styles.bufferingTitle}>Buffering Detected</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${(bufferingTime / bufferThreshold) * 100}%` }]} />
            </View>
            <Text style={styles.switchCountdown}>
              Auto-switch in {Math.ceil((bufferThreshold - bufferingTime) / 1000)}s
            </Text>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsBuffering(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {error && (
        <TouchableOpacity style={styles.errorOverlay} onPress={handleRetry}>
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorTitle}>{error}</Text>
          <Text style={styles.errorSubtitle}>This stream may be offline or geo-restricted</Text>
          <View style={styles.retryButton}>
            <RotateCw color="#fff" size={18} strokeWidth={2} />
            <Text style={styles.retryText}>Retry</Text>
          </View>
          <TouchableOpacity style={styles.switchButton} onPress={handleAutoSwitch}>
            <Text style={styles.switchButtonText}>Switch to Next Channel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {!channel && !loading && (
        <View style={[styles.placeholder]}>
          <View style={styles.placeholderIcon}>
            <Play color="#475569" size={48} strokeWidth={1.5} />
          </View>
          <Text style={styles.placeholderText}>Select a channel to start</Text>
          <Text style={styles.placeholderSubtext}>{channels.length} channels available</Text>
        </View>
      )}

      {Platform.OS === 'web' ? (
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            display: channel ? 'block' : 'none',
            backgroundColor: '#000',
            objectFit: aspectRatio === '16:9' ? 'contain' : aspectRatio === '4:3' ? 'contain' : 'cover',
          } as any}
          playsInline
          autoPlay
          muted={muted}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onPause={handlePause}
          onError={handleError}
          onCanPlay={handleCanPlay}
        />
      ) : (
        channel ? (
          <NativeVideoWrapper
            channel={channel}
            onPlaying={handlePlaying}
            onPause={handlePause}
            onWaiting={handleWaiting}
            onCanPlay={handleCanPlay}
            onError={handleError}
            videoViewRef={videoViewRef}
            playerRef={nativePlayerRef}
            aspectRatio={aspectRatio}
            muted={muted}
            volume={volume}
          />
        ) : null
      )}

      {channel && !loading && !error && showControls && (
        <View style={styles.controlsContainer}>
          <View style={styles.controlsTop}>
            <View style={styles.channelInfo}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <Text style={styles.channelName}>{channel.name}</Text>
            </View>
          </View>

          <View style={styles.controlsCenter}>
            <TouchableOpacity style={styles.sideControl} onPress={() => {
              if (!channel) return;
              const idx = channels.findIndex(c => c.id === channel.id);
              if (idx > 0) onChannelSwitch(channels[idx - 1]);
            }}>
              <ChevronLeft color="#fff" size={32} strokeWidth={2} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.playButton} onPress={togglePlay}>
              {isPlaying ? (
                <Pause color="#fff" size={32} strokeWidth={2} />
              ) : (
                <Play color="#fff" size={32} strokeWidth={2} style={styles.playIcon} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideControl} onPress={() => {
              if (!channel) return;
              const idx = channels.findIndex(c => c.id === channel.id);
              if (idx < channels.length - 1) onChannelSwitch(channels[idx + 1]);
            }}>
              <ChevronRight color="#fff" size={32} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.controlsBottom}>
            {showSettingsMenu && (
              <View style={styles.settingsMenu}>
                <Text style={styles.settingsMenuTitle}>Resolution</Text>
                <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
                  {qualityOptions.map(q => (
                    <TouchableOpacity
                      key={q.value}
                      style={[
                        styles.settingsMenuItem,
                        settings.preferredQuality === q.value && styles.settingsMenuItemActive
                      ]}
                      onPress={() => {
                        settings.updateSetting('preferredQuality', q.value as any);
                        setShowSettingsMenu(false);
                      }}
                    >
                      <Text style={[
                        styles.settingsMenuText,
                        settings.preferredQuality === q.value && styles.settingsMenuTextActive
                      ]}>{q.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.controlButton} onPress={toggleMute}>
                {muted ? (
                  <VolumeX color="#fff" size={22} strokeWidth={2} />
                ) : (
                  <Volume2 color="#fff" size={22} strokeWidth={2} />
                )}
              </TouchableOpacity>

              {Platform.OS === 'web' && (
                <View style={styles.volumeSlider}>
                  <View style={styles.volumeTrack}>
                    <View style={[styles.volumeFill, { width: `${muted ? 0 : volume * 100}%` }]} />
                    <View style={[styles.volumeThumb, { left: `${muted ? 0 : volume * 100}%` }]} />
                  </View>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={muted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    style={{ width: 80, opacity: 0, position: 'absolute', left: 0, right: 0 } as any}
                  />
                </View>
              )}

              <TouchableOpacity style={styles.controlButton} onPress={() => setPlaybackRate(r => r === 1 ? 1.5 : r === 1.5 ? 2 : 1)}>
                <Text style={styles.speedText}>{playbackRate}x</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={handlePiP}>
                <PictureInPicture2 color="#fff" size={20} strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => setAspectRatio(r => r === '16:9' ? '4:3' : r === '4:3' ? '21:9' : '16:9')}>
                <Text style={styles.ratioText}>{aspectRatio}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => setShowSettingsMenu(!showSettingsMenu)}>
                <Settings color={showSettingsMenu ? "#6366f1" : "#fff"} size={20} strokeWidth={2} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={handleFullscreen}>
                {isFullscreen ? (
                  <Minimize color="#fff" size={20} strokeWidth={2} />
                ) : (
                  <Maximize color="#fff" size={20} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  if (Platform.OS !== 'web' && isFullscreen) {
    return (
      <Modal visible={isFullscreen} transparent={false} animationType="fade" supportedOrientations={['landscape', 'portrait']} onRequestClose={handleFullscreen}>
        {renderContent()}
      </Modal>
    );
  }

  return renderContent();
});

VideoPlayer.displayName = 'VideoPlayer';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', position: 'relative' },
  containerFullscreen: { position: 'fixed' as any, top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  loadingContainer: { alignItems: 'center', gap: 16 },
  loadingText: { color: '#94a3b8', fontSize: 14 },
  bufferingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 15 },
  bufferingContent: { alignItems: 'center', gap: 12, padding: 24, borderRadius: 16, backgroundColor: 'rgba(255, 255, 255, 0.05)' },
  bufferingTitle: { color: '#fbbf24', fontSize: 16, fontWeight: '700' },
  progressBarContainer: { width: 200, height: 6, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#fbbf24', borderRadius: 3 },
  switchCountdown: { color: '#94a3b8', fontSize: 12 },
  cancelButton: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 8 },
  cancelText: { color: '#e2e8f0', fontSize: 13, fontWeight: '500' },
  errorOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 20, gap: 12 },
  errorIcon: { fontSize: 48 },
  errorTitle: { color: '#f87171', fontSize: 18, fontWeight: '700' },
  errorSubtitle: { color: '#64748b', fontSize: 13, textAlign: 'center', paddingHorizontal: 32 },
  retryButton: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#6366f1', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, marginTop: 8 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  switchButton: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10 },
  switchButtonText: { color: '#94a3b8', fontSize: 13 },
  placeholder: { flex: 1, backgroundColor: '#0a0a12', justifyContent: 'center', alignItems: 'center', gap: 16 },
  placeholderIcon: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255, 255, 255, 0.05)', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#e2e8f0', fontSize: 18, fontWeight: '600' },
  placeholderSubtext: { color: '#64748b', fontSize: 13 },
  controlsContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', zIndex: 5 },
  controlsTop: { padding: 16, paddingTop: 12 },
  channelInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#dc2626', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  liveText: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  channelName: { color: '#fff', fontSize: 14, fontWeight: '600', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  controlsCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  sideControl: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
  playButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(99, 102, 241, 0.9)', justifyContent: 'center', alignItems: 'center' },
  playIcon: { marginLeft: 4 },
  controlsBottom: { padding: 16, paddingBottom: 12 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 12 },
  controlButton: { width: 40, height: 40, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  volumeSlider: { width: 80, height: 40, justifyContent: 'center' },
  volumeTrack: { height: 4, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 2 },
  volumeFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 2 },
  volumeThumb: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: '#fff', top: -4, transform: [{ translateX: -6 }] },
  speedText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  ratioText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  settingsMenu: { position: 'absolute', bottom: 65, right: 16, backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: 12, padding: 8, minWidth: 150 },
  settingsMenuTitle: { color: '#94a3b8', fontSize: 12, marginBottom: 8, textAlign: 'center', fontWeight: 'bold' },
  settingsMenuItem: { paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'transparent', borderRadius: 8, marginBottom: 4 },
  settingsMenuItemActive: { backgroundColor: 'rgba(99, 102, 241, 0.5)' },
  settingsMenuText: { color: '#cbd5e1', fontSize: 14 },
  settingsMenuTextActive: { color: '#fff' },
});

export { VideoPlayer };
