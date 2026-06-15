import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, Trophy } from 'lucide-react-native';
import { Channel } from '@/types/channel';
import { useTheme } from '@/contexts/SettingsContext';

interface ChannelCardProps {
  channel: Channel;
  isActive: boolean;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}

const GROUP_COLORS: Record<string, string> = {
  'sports': '#22c55e',
  'fifa': '#fbbf24',
  'news': '#f59e0b',
  'entertainment': '#ec4899',
  'kids': '#06b6d4',
  'movies': '#8b5cf6',
  'music': '#f43f5e',
  'religious': '#84cc16',
  'weather': '#0ea5e9',
  'bangla': '#14b8a6',
  'hindi': '#f97316',
  'english': '#3b82f6',
};

function getGroupColor(group: string): string {
  const key = group.split(',')[0].trim().toLowerCase();
  for (const [k, color] of Object.entries(GROUP_COLORS)) {
    if (key.includes(k)) return color;
  }
  return '#6366f1';
}

export function ChannelCard({
  channel,
  isActive,
  isFavorite,
  onPress,
  onToggleFavorite,
}: ChannelCardProps) {
  const theme = useTheme();
  const groupColor = getGroupColor(channel.group);
  const primaryGroup = channel.group.split(',')[0].trim();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
        isActive && { backgroundColor: theme.primaryMuted, borderColor: 'rgba(99, 102, 241, 0.3)' }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.logoWrapper, isActive && { borderColor: groupColor }]}>
        {channel.logo ? (
          <Image
            source={{ uri: channel.logo }}
            style={styles.logo}
            resizeMode="contain"
            onError={() => {}}
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Trophy color={theme.textDim} size={20} strokeWidth={2} />
          </View>
        )}
        {isActive && (
          <View style={[styles.activeIndicator, { backgroundColor: groupColor }]} />
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }, isActive && { color: theme.secondary }]} numberOfLines={1}>
          {channel.name}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: `${groupColor}15`, borderColor: `${groupColor}40` }]}>
            <View style={[styles.badgeDot, { backgroundColor: groupColor }]} />
            <Text style={[styles.badgeText, { color: groupColor }]}>
              {primaryGroup}
            </Text>
          </View>
          {isActive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.favButton}
        onPress={onToggleFavorite}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Star
          color={isFavorite ? '#fbbf24' : theme.textDim}
          size={20}
          fill={isFavorite ? '#fbbf24' : 'transparent'}
          strokeWidth={2}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 3,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  logoWrapper: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  info: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 5,
    borderWidth: 1,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dc2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  favButton: {
    padding: 8,
    borderRadius: 8,
  },
});
