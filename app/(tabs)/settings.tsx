import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Zap,
  Clock,
  Wifi,
  Trash2,
  ChevronRight,
  Shield,
  Moon,
  Sun,
  Monitor,
  Bell,
  Database,
  Eye,
  Volume2,
  Globe,
  RotateCcw,
  Film,
  Info,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSettings, THEMES, useTheme } from '@/contexts/SettingsContext';
import { useFavorites } from '@/hooks/useFavorites';

export default function SettingsScreen() {
  const settings = useSettings();
  const theme = useTheme();
  const { favorites } = useFavorites();
  const [expandedSection, setExpandedSection] = useState<string | null>('playback');

  const handleClearFavorites = () => {
    Alert.alert(
      'Clear Favorites',
      `Are you sure you want to remove all ${favorites.length} favorite channels?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('sports_tv_favorites');
            Alert.alert('Success', 'All favorites have been cleared');
          },
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear Watch History',
      'Are you sure you want to clear your watch history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('watch_history');
            Alert.alert('Success', 'Watch history cleared');
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset All Settings',
      'This will reset all settings to their default values.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            settings.resetSettings();
            Alert.alert('Success', 'Settings have been reset');
          },
        },
      ]
    );
  };

  const ThemeIcon = () => {
    if (settings.themeMode === 'system') return <Monitor color={theme.primary} size={18} strokeWidth={2} />;
    if (settings.themeMode === 'light') return <Sun color="#f59e0b" size={18} strokeWidth={2} />;
    return <Moon color="#6366f1" size={18} strokeWidth={2} />;
  };

  const SettingRow = ({
    icon,
    iconBg,
    title,
    subtitle,
    trailing,
    onPress,
    showChevron = false,
  }: {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    subtitle?: string;
    trailing?: React.ReactNode;
    onPress?: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: theme.card, borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress && !showChevron}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIconBg, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, { color: theme.text }]}>{title}</Text>
        {subtitle && <Text style={[styles.rowDesc, { color: theme.textMuted }]}>{subtitle}</Text>}
      </View>
      {trailing}
      {showChevron && <ChevronRight color={theme.textDim} size={18} strokeWidth={2} />}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, sectionId }: { title: string; sectionId: string }) => (
    <TouchableOpacity
      style={[styles.sectionHeader, { backgroundColor: theme.surface }]}
      onPress={() => setExpandedSection(expandedSection === sectionId ? null : sectionId)}
      activeOpacity={0.7}
    >
      <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{title}</Text>
      <ChevronRight
        color={theme.textMuted}
        size={16}
        strokeWidth={2}
        style={{ transform: [{ rotate: expandedSection === sectionId ? '90deg' : '0deg' }] }}
      />
    </TouchableOpacity>
  );

  const thresholds = [
    { value: 3000, label: '3s' },
    { value: 5000, label: '5s' },
    { value: 8000, label: '8s' },
    { value: 10000, label: '10s' },
  ];

  const qualityOptions = [
    { value: 'auto', label: 'Auto' },
    { value: 'low', label: 'Low (480p)' },
    { value: 'medium', label: 'Medium (720p)' },
    { value: 'high', label: 'High (1080p)' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.titleRow}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primaryMuted }]}>
            <Shield color={theme.primary} size={22} strokeWidth={2} />
          </View>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>Configure your experience</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Theme Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <SectionHeader title="Appearance" sectionId="appearance" />

          {expandedSection === 'appearance' && (
            <View style={styles.sectionContent}>
              <SettingRow
                icon={<ThemeIcon />}
                iconBg={theme.primaryMuted}
                title="Theme Mode"
                subtitle={`Current: ${settings.themeMode.charAt(0).toUpperCase() + settings.themeMode.slice(1)}`}
                onPress={settings.toggleTheme}
                showChevron
              />

              <View style={styles.themeButtons}>
                {(['system', 'light', 'dark'] as const).map(mode => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.themeButton,
                      settings.themeMode === mode && { backgroundColor: theme.primary, borderColor: theme.primary },
                      { backgroundColor: settings.themeMode === mode ? theme.primary : theme.card, borderColor: settings.themeMode === mode ? theme.primary : theme.border }
                    ]}
                    onPress={() => settings.updateSetting('themeMode', mode)}
                  >
                    {mode === 'system' && <Monitor color={settings.themeMode === mode ? '#fff' : theme.textMuted} size={16} strokeWidth={2} />}
                    {mode === 'light' && <Sun color={settings.themeMode === mode ? '#fff' : theme.textMuted} size={16} strokeWidth={2} />}
                    {mode === 'dark' && <Moon color={settings.themeMode === mode ? '#fff' : theme.textMuted} size={16} strokeWidth={2} />}
                    <Text style={[styles.themeButtonText, { color: settings.themeMode === mode ? '#fff' : theme.textMuted }]}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <SettingRow
                icon={<Eye color="#06b6d4" size={18} strokeWidth={2} />}
                iconBg="rgba(6, 182, 212, 0.15)"
                title="Reduced Motion"
                subtitle="Minimize animations"
                trailing={
                  <Switch
                    value={settings.reducedMotion}
                    onValueChange={(v) => settings.updateSetting('reducedMotion', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />

              <SettingRow
                icon={<Eye color="#8b5cf6" size={18} strokeWidth={2} />}
                iconBg="rgba(139, 92, 246, 0.15)"
                title="High Contrast"
                subtitle="Increase text visibility"
                trailing={
                  <Switch
                    value={settings.highContrast}
                    onValueChange={(v) => settings.updateSetting('highContrast', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />

              <SettingRow
                icon={<Eye color="#22c55e" size={18} strokeWidth={2} />}
                iconBg="rgba(34, 197, 94, 0.15)"
                title="Large Text"
                subtitle="Increase text size"
                trailing={
                  <Switch
                    value={settings.largeText}
                    onValueChange={(v) => settings.updateSetting('largeText', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />
            </View>
          )}
        </View>

        {/* Playback Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <SectionHeader title="Playback" sectionId="playback" />

          {expandedSection === 'playback' && (
            <View style={styles.sectionContent}>
              <SettingRow
                icon={<Zap color="#fbbf24" size={18} strokeWidth={2} />}
                iconBg="rgba(251, 191, 36, 0.15)"
                title="Auto-Switch on Buffer"
                subtitle="Automatically switch when buffering"
                trailing={
                  <Switch
                    value={settings.autoSwitchOnBuffer}
                    onValueChange={(v) => settings.updateSetting('autoSwitchOnBuffer', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />

              <View style={[styles.row, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <View style={[styles.rowIconBg, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                  <Clock color="#22c55e" size={18} strokeWidth={2} />
                </View>
                <View style={styles.rowContent}>
                  <Text style={[styles.rowTitle, { color: theme.text }]}>Buffer Threshold</Text>
                  <Text style={[styles.rowDesc, { color: theme.textMuted }]}>
                    {settings.bufferThreshold / 1000}s before switching
                  </Text>
                </View>
              </View>

              <View style={styles.thresholdRow}>
                {thresholds.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[
                      styles.thresholdChip,
                      settings.bufferThreshold === t.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                      { backgroundColor: settings.bufferThreshold === t.value ? theme.primary : theme.card, borderColor: settings.bufferThreshold === t.value ? theme.primary : theme.border }
                    ]}
                    onPress={() => settings.updateSetting('bufferThreshold', t.value)}
                  >
                    <Text style={[
                      styles.thresholdText,
                      { color: settings.bufferThreshold === t.value ? '#fff' : theme.textMuted }
                    ]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <SettingRow
                icon={<Wifi color="#3b82f6" size={18} strokeWidth={2} />}
                iconBg="rgba(59, 130, 246, 0.15)"
                title="Low Latency Mode"
                subtitle="Reduce buffering for live streams"
                trailing={
                  <Switch
                    value={settings.lowLatencyMode}
                    onValueChange={(v) => settings.updateSetting('lowLatencyMode', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />

              <SettingRow
                icon={<Volume2 color="#ec4899" size={18} strokeWidth={2} />}
                iconBg="rgba(236, 72, 153, 0.15)"
                title="Default Volume"
                subtitle={`${Math.round(settings.defaultVolume * 100)}%`}
              />

              <View style={styles.volumeSliderContainer}>
                {Platform.OS === 'web' ? (
                  <>
                    <View style={styles.volumeLabels}>
                      <Text style={[styles.volumeLabel, { color: theme.textMuted }]}>0%</Text>
                      <Text style={[styles.volumeLabel, { color: theme.textMuted }]}>100%</Text>
                    </View>
                    <View style={[styles.volumeTrack, { backgroundColor: theme.border }]}>
                      <View style={[styles.volumeFill, { width: `${settings.defaultVolume * 100}%`, backgroundColor: theme.primary }]} />
                    </View>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.1}
                      value={settings.defaultVolume}
                      onChange={(e) => settings.updateSetting('defaultVolume', parseFloat((e.target as HTMLInputElement).value))}
                      style={styles.volumeInput as any}
                    />
                  </>
                ) : (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                     <TouchableOpacity 
                       onPress={() => settings.updateSetting('defaultVolume', Math.max(0, settings.defaultVolume - 0.1))} 
                       style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card, borderRadius: 8 }}
                     >
                       <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>-</Text>
                     </TouchableOpacity>
                     
                     <View style={[styles.volumeTrack, { flex: 1, marginHorizontal: 16, backgroundColor: theme.border }]}>
                        <View style={[styles.volumeFill, { width: `${settings.defaultVolume * 100}%`, backgroundColor: theme.primary }]} />
                     </View>
                     
                     <TouchableOpacity 
                       onPress={() => settings.updateSetting('defaultVolume', Math.min(1, settings.defaultVolume + 0.1))} 
                       style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card, borderRadius: 8 }}
                     >
                       <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold' }}>+</Text>
                     </TouchableOpacity>
                  </View>
                )}
              </View>

              <SettingRow
                icon={<Film color="#f97316" size={18} strokeWidth={2} />}
                iconBg="rgba(249, 115, 22, 0.15)"
                title="Preferred Quality"
                subtitle={`Current: ${settings.preferredQuality.charAt(0).toUpperCase() + settings.preferredQuality.slice(1)}`}
              />

              <View style={styles.qualityRow}>
                {qualityOptions.map(q => (
                  <TouchableOpacity
                    key={q.value}
                    style={[
                      styles.qualityChip,
                      settings.preferredQuality === q.value && { backgroundColor: theme.primary, borderColor: theme.primary },
                      { backgroundColor: settings.preferredQuality === q.value ? theme.primary : theme.card, borderColor: settings.preferredQuality === q.value ? theme.primary : theme.border }
                    ]}
                    onPress={() => settings.updateSetting('preferredQuality', q.value as 'auto' | 'low' | 'medium' | 'high')}
                  >
                    <Text style={[
                      styles.qualityText,
                      { color: settings.preferredQuality === q.value ? '#fff' : theme.textMuted }
                    ]}>
                      {q.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <SettingRow
                icon={<Zap color="#10b981" size={18} strokeWidth={2} />}
                iconBg="rgba(16, 185, 129, 0.15)"
                title="Auto Play"
                subtitle="Start playback automatically"
                trailing={
                  <Switch
                    value={settings.autoPlay}
                    onValueChange={(v) => settings.updateSetting('autoPlay', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />

              <SettingRow
                icon={<Clock color="#a855f7" size={18} strokeWidth={2} />}
                iconBg="rgba(168, 85, 247, 0.15)"
                title="Remember Last Channel"
                subtitle="Resume where you left off"
                trailing={
                  <Switch
                    value={settings.rememberLastChannel}
                    onValueChange={(v) => settings.updateSetting('rememberLastChannel', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />
            </View>
          )}
        </View>

        {/* Notifications Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <SectionHeader title="Notifications" sectionId="notifications" />

          {expandedSection === 'notifications' && (
            <View style={styles.sectionContent}>
              <SettingRow
                icon={<Bell color="#f59e0b" size={18} strokeWidth={2} />}
                iconBg="rgba(245, 158, 11, 0.15)"
                title="Stream Alerts"
                subtitle="Get notified about stream issues"
                trailing={
                  <Switch
                    value={settings.streamAlerts}
                    onValueChange={(v) => settings.updateSetting('streamAlerts', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />

              <SettingRow
                icon={<Bell color="#22c55e" size={18} strokeWidth={2} />}
                iconBg="rgba(34, 197, 94, 0.15)"
                title="New Channel Alerts"
                subtitle="Get notified about new channels"
                trailing={
                  <Switch
                    value={settings.newChannelAlerts}
                    onValueChange={(v) => settings.updateSetting('newChannelAlerts', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />
            </View>
          )}
        </View>

        {/* Data Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <SectionHeader title="Data & Privacy" sectionId="data" />

          {expandedSection === 'data' && (
            <View style={styles.sectionContent}>
              <SettingRow
                icon={<Database color="#3b82f6" size={18} strokeWidth={2} />}
                iconBg="rgba(59, 130, 246, 0.15)"
                title="Watch History"
                subtitle="Track channels you've watched"
                trailing={
                  <Switch
                    value={settings.watchHistory}
                    onValueChange={(v) => settings.updateSetting('watchHistory', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />

              <SettingRow
                icon={<Database color="#6366f1" size={18} strokeWidth={2} />}
                iconBg="rgba(99, 102, 241, 0.15)"
                title="Cache Streams"
                subtitle="Improve loading times"
                trailing={
                  <Switch
                    value={settings.cacheStreams}
                    onValueChange={(v) => settings.updateSetting('cacheStreams', v)}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#fff"
                  />
                }
              />

              <SettingRow
                icon={<Trash2 color="#f43f5e" size={18} strokeWidth={2} />}
                iconBg="rgba(244, 63, 94, 0.15)"
                title="Clear Favorites"
                subtitle={`${favorites.length} channels saved`}
                onPress={favorites.length > 0 ? handleClearFavorites : undefined}
                showChevron
              />

              <SettingRow
                icon={<Trash2 color="#f43f5e" size={18} strokeWidth={2} />}
                iconBg="rgba(244, 63, 94, 0.15)"
                title="Clear Watch History"
                subtitle="Remove all watch history"
                onPress={handleClearHistory}
                showChevron
              />

              <SettingRow
                icon={<Trash2 color="#f43f5e" size={18} strokeWidth={2} />}
                iconBg="rgba(244, 63, 94, 0.15)"
                title="Clear All Data"
                subtitle="Reset everything"
                onPress={handleResetSettings}
                showChevron
              />
            </View>
          )}
        </View>

        {/* Language Section */}
        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <SectionHeader title="Language" sectionId="language" />

          {expandedSection === 'language' && (
            <View style={styles.sectionContent}>
              <SettingRow
                icon={<Globe color="#06b6d4" size={18} strokeWidth={2} />}
                iconBg="rgba(6, 182, 212, 0.15)"
                title="App Language"
                subtitle="English"
                showChevron
              />
            </View>
          )}
        </View>

        {/* About Section */}
        <View style={[styles.section, { backgroundColor: theme.surface, marginBottom: 32 }]}>
          <SectionHeader title="About" sectionId="about" />

          {expandedSection === 'about' && (
            <View style={styles.sectionContent}>
              <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>App Name</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>Sports TV Live</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Version</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>1.0.0</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: theme.textMuted }]}>Channels</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>170+</Text>
                </View>
              </View>

              <View style={[styles.featureBox, { backgroundColor: theme.primaryMuted }]}>
                <Text style={[styles.featureTitle, { color: theme.primary }]}>Auto-Switch Feature</Text>
                <Text style={[styles.featureText, { color: theme.text }]}>
                  When buffering is detected, the player automatically switches to the next available channel after the threshold time. This ensures smooth viewing without interruptions.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  scrollContent: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 12,
  },
  subtitle: {
    fontSize: 13,
    marginLeft: 12,
    marginTop: 2,
  },
  section: {
    marginHorizontal: 12,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionContent: {
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  rowIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowContent: {
    flex: 1,
    marginRight: 8,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  thresholdRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  thresholdChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  thresholdText: {
    fontWeight: '600',
    fontSize: 13,
  },
  qualityRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  qualityChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  qualityText: {
    fontWeight: '600',
    fontSize: 12,
  },
  themeButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  themeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  volumeSliderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  volumeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  volumeLabel: {
    fontSize: 11,
  },
  volumeTrack: {
    height: 6,
    borderRadius: 3,
    position: 'relative',
  },
  volumeFill: {
    height: '100%',
    borderRadius: 3,
  },
  volumeInput: {
    width: '100%',
    height: 24,
    marginTop: -15,
    opacity: 0,
    position: 'absolute',
  },
  infoBox: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  featureBox: {
    margin: 16,
    padding: 14,
    borderRadius: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 13,
    lineHeight: 19,
  },
});
