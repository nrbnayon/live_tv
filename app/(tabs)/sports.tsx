import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Trophy, Target, Flame } from 'lucide-react-native';
import { Channel } from '@/types/channel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelCard } from '@/components/ChannelCard';
import { SearchBar } from '@/components/SearchBar';
import { Skeleton, ChannelCardSkeleton } from '@/components/Skeleton';
import { getSportsChannels, CATEGORIES } from '@/data/channels';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/contexts/SettingsContext';

export default function SportsScreen() {
  const theme = useTheme();
  const [channels] = useState<Channel[]>(getSportsChannels());
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const filteredChannels = channels.filter(channel => {
    const matchesCategory = activeCategory === 'all' ||
      channel.group.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = !searchQuery ||
      channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleChannelSelect = useCallback((channel: Channel) => {
    setActiveChannel(channel);
  }, []);

  const handleChannelSwitch = useCallback((channel: Channel) => {
    setActiveChannel(channel);
  }, []);

  const ListHeader = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
          <Trophy color="#22c55e" size={22} strokeWidth={2} />
        </View>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Sports TV</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>Live sports from around the world</Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search sports channels..."
      />

      <FlatList
        horizontal
        data={CATEGORIES.filter(c => ['all', 'sports'].includes(c.id) || c.id === 'sports')}
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryChip,
              activeCategory === item.id && { backgroundColor: item.color, borderColor: item.color },
              { backgroundColor: activeCategory === item.id ? item.color : theme.card, borderColor: activeCategory === item.id ? item.color : theme.border }
            ]}
            onPress={() => setActiveCategory(item.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.categoryEmoji]}>
              {item.id === 'all' ? '📺' : item.id === 'sports' ? '🏆' : '⚽'}
            </Text>
            <Text style={[
              styles.categoryText,
              activeCategory === item.id && styles.categoryTextActive,
              { color: activeCategory === item.id ? '#fff' : theme.textMuted }
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      <View style={[styles.statsRow, { backgroundColor: theme.card }]}>
        <View style={styles.statItem}>
          <Target color={theme.primary} size={20} strokeWidth={2} />
          <Text style={[styles.statValue, { color: theme.text }]}>{filteredChannels.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Channels</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Flame color="#f59e0b" size={20} strokeWidth={2} />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {filteredChannels.filter(c => isFavorite(c.id)).length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Favorites</Text>
        </View>
      </View>
    </View>
  );

  const renderChannel = ({ item }: { item: Channel }) => (
    <ChannelCard
      channel={item}
      isActive={activeChannel?.id === item.id}
      isFavorite={isFavorite(item.id)}
      onPress={() => handleChannelSelect(item)}
      onToggleFavorite={() => toggleFavorite(item.id)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
        <View style={styles.videoSection}>
          <Skeleton width="100%" height="100%" borderRadius={0} />
        </View>
        <View style={[styles.contentSection, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Skeleton width={44} height={44} borderRadius={12} />
              <View style={{ marginLeft: 12 }}>
                <Skeleton width={120} height={24} borderRadius={4} />
                <Skeleton width={200} height={12} borderRadius={4} style={{ marginTop: 4 }} />
              </View>
            </View>
            <Skeleton width="90%" height={44} borderRadius={16} style={{ marginTop: 16 }} />
          </View>
          {[1, 2, 3, 4].map(i => (
            <ChannelCardSkeleton key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['left', 'right']}>
      <View style={styles.videoSection}>
        <VideoPlayer
          channel={activeChannel}
          channels={filteredChannels}
          onChannelSwitch={handleChannelSwitch}
          autoSwitchOnBuffer={true}
          bufferThreshold={5000}
        />
      </View>

      <View style={[styles.contentSection, { backgroundColor: theme.surface }]}>
        {activeChannel && (
          <View style={[styles.playingHeader, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>LIVE</Text>
            </View>
            <Text style={[styles.playingName, { color: theme.text }]} numberOfLines={1}>{activeChannel.name}</Text>
          </View>
        )}

        <FlatList
          data={filteredChannels}
          keyExtractor={item => 'sports-' + item.id}
          renderItem={renderChannel}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a12',
  },
  videoSection: {
    height: 200,
  },
  contentSection: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  playingHeader: {
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#dc2626',
  },
  liveTagText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  playingName: {
    fontSize: 15,
    fontWeight: '600',
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  categoriesContainer: {
    gap: 10,
    paddingBottom: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 4,
    borderRadius: 14,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  listContent: {
    paddingBottom: 24,
  },
});
