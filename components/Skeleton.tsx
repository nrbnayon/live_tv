import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function ChannelCardSkeleton() {
  return (
    <View style={styles.channelCard}>
      <Skeleton width={48} height={48} borderRadius={10} />
      <View style={styles.channelInfo}>
        <Skeleton width={120} height={14} borderRadius={4} />
        <Skeleton width={80} height={12} borderRadius={4} style={styles.channelMeta} />
      </View>
      <Skeleton width={20} height={20} borderRadius={10} />
    </View>
  );
}

export function CategorySkeleton() {
  return (
    <View style={styles.categoryChip}>
      <Skeleton width={70} height={32} borderRadius={16} />
    </View>
  );
}

export function HeaderSkeleton() {
  return (
    <View style={styles.header}>
      <Skeleton width={200} height={28} borderRadius={6} />
      <Skeleton width={180} height={14} borderRadius={4} style={styles.headerSubtitle} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  channelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 4,
    gap: 12,
  },
  channelInfo: {
    flex: 1,
    gap: 4,
  },
  channelMeta: {
    marginTop: 4,
  },
  categoryChip: {
    marginHorizontal: 5,
  },
  header: {
    padding: 16,
    gap: 8,
  },
  headerSubtitle: {
    marginTop: 4,
  },
});
