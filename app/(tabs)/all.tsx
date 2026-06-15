import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Radio, Sparkles } from 'lucide-react-native';
import { Channel } from '@/types/channel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelCard } from '@/components/ChannelCard';
import { SearchBar } from '@/components/SearchBar';
import { GroupFilter } from '@/components/GroupFilter';
import { Skeleton, ChannelCardSkeleton } from '@/components/Skeleton';
import { ALL_CHANNELS, getGroups } from '@/data/channels';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/contexts/SettingsContext';

export default function AllChannelsScreen() {
  const theme = useTheme();
  const [channels] = useState<Channel[]>(ALL_CHANNELS);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [activeGroup, setActiveGroup] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  const groups = getGroups(channels);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredChannels = channels.filter(channel => {
    const matchesGroup = activeGroup === 'All' || channel.group.includes(activeGroup);
    const matchesSearch = !searchQuery || channel.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
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
        <View style={[styles.iconContainer, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
          <Radio color={theme.primary} size={20} strokeWidth={2} />
        </View>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>All Channels</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {channels.length} channels available
          </Text>
        </View>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search all channels..."
      />

      <GroupFilter
        groups={groups}
        activeGroup={activeGroup}
        onGroupSelect={setActiveGroup}
      />

      <View style={[styles.statsContainer, { backgroundColor: theme.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{filteredChannels.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Channels</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{groups.length - 1}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Categories</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.text }]}>{favorites.length}</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Favorites</Text>
        </View>
      </View>

      {searchQuery && (
        <Text style={[styles.resultsText, { color: theme.textMuted }]}>
          {filteredChannels.length} result{filteredChannels.length !== 1 ? 's' : ''} for "{searchQuery}"
        </Text>
      )}
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
          <View style={styles.videoPlaceholder}>
            <Skeleton width="100%" height="100%" borderRadius={0} />
          </View>
        </View>
        <View style={[styles.contentSection, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Skeleton width={28} height={28} borderRadius={6} />
              <Skeleton width={150} height={28} borderRadius={6} />
            </View>
            <Skeleton width={200} height={14} borderRadius={4} style={{ marginTop: 8 }} />
            <Skeleton width="90%" height={44} borderRadius={16} style={{ marginTop: 16 }} />
          </View>
          {[1, 2, 3, 4, 5].map(i => (
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
          <View style={[styles.playingHeader, { backgroundColor: theme.primaryMuted }]}>
            <View style={styles.liveTag}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>NOW PLAYING</Text>
            </View>
            <Text style={[styles.playingName, { color: theme.text }]} numberOfLines={1}>{activeChannel.name}</Text>
          </View>
        )}

        <FlatList
          data={filteredChannels}
          keyExtractor={item => 'all-' + item.id}
          renderItem={renderChannel}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Sparkles color={theme.textDim} size={48} strokeWidth={1.5} />
              <Text style={[styles.emptyTitle, { color: theme.textDim }]}>No channels found</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>Try adjusting your search or filters</Text>
            </View>
          }
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
    height: 220,
  },
  videoPlaceholder: {
    flex: 1,
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
    marginBottom: 4,
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
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
    borderRadius: 14,
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
  },
  resultsText: {
    fontSize: 12,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
});
