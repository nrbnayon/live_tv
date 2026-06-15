import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Star, Heart, Sparkles } from 'lucide-react-native';
import { Channel } from '@/types/channel';
import { VideoPlayer } from '@/components/VideoPlayer';
import { ChannelCard } from '@/components/ChannelCard';
import { Skeleton, ChannelCardSkeleton } from '@/components/Skeleton';
import { ALL_CHANNELS } from '@/data/channels';
import { useFavorites } from '@/hooks/useFavorites';
import { useTheme } from '@/contexts/SettingsContext';

export default function FavoritesScreen() {
  const theme = useTheme();
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const favoriteChannels = ALL_CHANNELS.filter(c =>
    favorites.includes(c.id)
  );

  const handleChannelSelect = useCallback((channel: Channel) => {
    setActiveChannel(channel);
  }, []);

  const handleChannelSwitch = useCallback((channel: Channel) => {
    setActiveChannel(channel);
  }, []);

  const ListHeader = (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <Image 
          source={require('@/assets/icons/logo.png')} 
          style={{ width: 44, height: 44, borderRadius: 10, marginRight: 12 }} 
          resizeMode="contain" 
        />
        <View>
          <Text style={[styles.title, { color: theme.text, marginLeft: 0 }]}>FIFAfy Favorites</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted, marginLeft: 0 }]}>
            {favorites.length > 0
              ? `${favoriteChannels.length} channels saved`
              : 'Your favorite channels'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderChannel = ({ item }: { item: Channel }) => (
    <ChannelCard
      channel={item}
      isActive={activeChannel?.id === item.id}
      isFavorite={true}
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
                <Skeleton width={100} height={24} borderRadius={4} />
                <Skeleton width={150} height={12} borderRadius={4} style={{ marginTop: 4 }} />
              </View>
            </View>
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
          channels={favoriteChannels.length > 0 ? favoriteChannels : ALL_CHANNELS}
          onChannelSwitch={handleChannelSwitch}
          autoSwitchOnBuffer={true}
          bufferThreshold={10000}
        />
      </View>

      <View style={[styles.contentSection, { backgroundColor: theme.surface }]}>
        <FlatList
          data={favoriteChannels}
          keyExtractor={item => 'fav-' + item.id}
          renderItem={renderChannel}
          ListHeaderComponent={ListHeader}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.card }]}>
                <Star color={theme.textDim} size={40} strokeWidth={1.5} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.textDim }]}>No favorites yet</Text>
              <Text style={[styles.emptyText, { color: theme.textMuted }]}>
                Tap the star icon on any channel to add it here
              </Text>
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
    height: 200,
  },
  contentSection: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    paddingTop: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
