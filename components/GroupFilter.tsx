import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import {
  Trophy,
  Newspaper,
  Film,
  Baby,
  Cloud,
  Music,
  Church,
  Tv,
  Globe,
  Clapperboard,
  Star,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/SettingsContext';

interface GroupFilterProps {
  groups: string[];
  activeGroup: string;
  onGroupSelect: (group: string) => void;
}

const GROUP_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  'All': { color: '#6366f1', icon: <Tv color="currentColor" size={16} strokeWidth={2} /> },
  'Sports': { color: '#22c55e', icon: <Trophy color="currentColor" size={16} strokeWidth={2} /> },
  'FIFA 2026': { color: '#fbbf24', icon: <Trophy color="currentColor" size={16} strokeWidth={2} /> },
  'News': { color: '#f59e0b', icon: <Newspaper color="currentColor" size={16} strokeWidth={2} /> },
  'Entertainment': { color: '#ec4899', icon: <Film color="currentColor" size={16} strokeWidth={2} /> },
  'Kids': { color: '#06b6d4', icon: <Baby color="currentColor" size={16} strokeWidth={2} /> },
  'Movies': { color: '#8b5cf6', icon: <Clapperboard color="currentColor" size={16} strokeWidth={2} /> },
  'Music': { color: '#f43f5e', icon: <Music color="currentColor" size={16} strokeWidth={2} /> },
  'Musics': { color: '#f43f5e', icon: <Music color="currentColor" size={16} strokeWidth={2} /> },
  'Religious': { color: '#84cc16', icon: <Church color="currentColor" size={16} strokeWidth={2} /> },
  'Weather': { color: '#0ea5e9', icon: <Cloud color="currentColor" size={16} strokeWidth={2} /> },
  'Bangla': { color: '#14b8a6', icon: <Globe color="currentColor" size={16} strokeWidth={2} /> },
  'Hindi': { color: '#f97316', icon: <Globe color="currentColor" size={16} strokeWidth={2} /> },
  'English': { color: '#3b82f6', icon: <Globe color="currentColor" size={16} strokeWidth={2} /> },
};

function getGroupConfig(group: string) {
  const key = Object.keys(GROUP_CONFIG).find(k => group.toLowerCase().includes(k.toLowerCase()));
  return GROUP_CONFIG[key || 'Sports'] || { color: '#6366f1', icon: <Star color="currentColor" size={16} strokeWidth={2} /> };
}

export function GroupFilter({ groups, activeGroup, onGroupSelect }: GroupFilterProps) {
  const theme = useTheme();
  const displayGroups = groups.filter(g => g !== 'All').slice(0, 12);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity
        style={[
          styles.chip,
          activeGroup === 'All' && { backgroundColor: theme.primary, borderColor: theme.primary },
          { backgroundColor: activeGroup === 'All' ? theme.primary : theme.card, borderColor: activeGroup === 'All' ? theme.primary : theme.border }
        ]}
        onPress={() => onGroupSelect('All')}
        activeOpacity={0.7}
      >
        <Tv
          color={activeGroup === 'All' ? '#fff' : theme.textMuted}
          size={16}
          strokeWidth={2}
        />
        <Text style={[styles.chipText, activeGroup === 'All' && styles.chipTextActive, { color: activeGroup === 'All' ? '#fff' : theme.textMuted }]}>
          All
        </Text>
      </TouchableOpacity>

      {displayGroups.map(group => {
        const config = getGroupConfig(group);
        const isActive = activeGroup === group;

        return (
          <TouchableOpacity
            key={group}
            style={[
              styles.chip,
              isActive && { backgroundColor: config.color, borderColor: config.color },
              { backgroundColor: isActive ? config.color : theme.card, borderColor: isActive ? config.color : theme.border }
            ]}
            onPress={() => onGroupSelect(group)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, { color: isActive ? '#fff' : config.color }]}>
              {React.cloneElement(config.icon as React.ReactElement, {
                color: isActive ? '#fff' : config.color,
              })}
            </View>
            <Text style={[
              styles.chipText,
              isActive && styles.chipTextActive,
              { color: isActive ? '#fff' : theme.textMuted }
            ]}>
              {group}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
    fontSize: 13,
  },
});
