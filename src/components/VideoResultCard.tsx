import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { ThemeColors } from '../constants/Colors';
import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';
import { VideoResult } from '../types';
import Card from './Card';

interface VideoResultCardProps {
  video: VideoResult;
  onPress?: () => void;
  variant?: 'compact' | 'detailed';
  showActions?: boolean;
  onWatchTrailer?: () => void;
  onReadMore?: () => void;
  onShare?: () => void;
}

export default function VideoResultCard({
  video,
  onPress,
  variant = 'detailed',
  showActions = true,
  onWatchTrailer,
  onReadMore,
  onShare,
}: VideoResultCardProps) {
  const { colors } = useTheme();
  const renderCompact = () => (
    <Card
      variant="default"
      onPress={onPress}
      style={styles(colors).compactCard}
    >
      <View style={styles(colors).compactContent}>
        <View style={styles(colors).thumbnail}>
          {video.posterUrl ? (
            <Image
              source={{ uri: video.posterUrl }}
              style={styles(colors).thumbnailImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="film" size={24} color={colors.textMuted} />
          )}
        </View>
        <View style={styles(colors).compactInfo}>
          <Text style={styles(colors).compactTitle} numberOfLines={2}>
            {video.title}
          </Text>
          <Text style={styles(colors).compactYear}>
            {video.year || 'Unknown Year'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </View>
    </Card>
  );

  const renderDetailed = () => (
    <Card variant="elevated" style={styles(colors).detailedCard}>
      {/* Poster */}
      <View style={styles(colors).posterContainer}>
        <View style={styles(colors).poster}>
          {video.posterUrl ? (
            <Image
              source={{ uri: video.posterUrl }}
              style={styles(colors).posterImage}
              resizeMode="cover"
            />
          ) : (
            <>
              <Ionicons name="film" size={48} color={colors.textMuted} />
              <Text style={styles(colors).posterText}>Poster</Text>
            </>
          )}
        </View>
      </View>

      {/* Content */}
      <View style={styles(colors).content}>
        <Text style={styles(colors).title}>{video.title}</Text>

        {video.year && <Text style={styles(colors).year}>{video.year}</Text>}

        {video.director && (
          <View style={styles(colors).detailRow}>
            <Ionicons name="person" size={16} color={colors.textSecondary} />
            <Text style={styles(colors).detailText}>{video.director}</Text>
          </View>
        )}

        {video.genre && (
          <View style={styles(colors).detailRow}>
            <Ionicons name="grid" size={16} color={colors.textSecondary} />
            <Text style={styles(colors).detailText}>{video.genre}</Text>
          </View>
        )}

        {video.duration && (
          <View style={styles(colors).detailRow}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={styles(colors).detailText}>{video.duration}</Text>
          </View>
        )}

        {video.imdbRating && (
          <View style={styles(colors).detailRow}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles(colors).detailText}>{video.imdbRating}/10</Text>
          </View>
        )}

        {video.description && (
          <Text style={styles(colors).description} numberOfLines={3}>
            {video.description}
          </Text>
        )}
      </View>

      {/* Actions */}
      {showActions && (
        <View style={styles(colors).actions}>
          {onWatchTrailer && (
            <TouchableOpacity
              style={[
                styles(colors).actionButton,
                styles(colors).primaryAction,
              ]}
              onPress={onWatchTrailer}
            >
              <Ionicons
                name="play-circle"
                size={20}
                color={colors.background}
              />
              <Text style={styles(colors).primaryActionText}>
                Watch Trailer
              </Text>
            </TouchableOpacity>
          )}

          {onReadMore && (
            <TouchableOpacity
              style={[
                styles(colors).actionButton,
                styles(colors).secondaryAction,
              ]}
              onPress={onReadMore}
            >
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.primary}
              />
              <Text style={styles(colors).secondaryActionText}>Read More</Text>
            </TouchableOpacity>
          )}

          {onShare && (
            <TouchableOpacity
              style={[
                styles(colors).actionButton,
                styles(colors).secondaryAction,
              ]}
              onPress={onShare}
            >
              <Ionicons name="share-social" size={20} color={colors.primary} />
              <Text style={styles(colors).secondaryActionText}>Share</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );

  return variant === 'compact' ? renderCompact() : renderDetailed();
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Compact variant
    compactCard: {
      marginBottom: Layout.spacing.sm,
    },
    compactContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    thumbnail: {
      width: 60,
      height: 80,
      borderRadius: Layout.borderRadius.md,
      backgroundColor: colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Layout.spacing.md,
    },
    thumbnailImage: {
      width: '100%',
      height: '100%',
      borderRadius: Layout.borderRadius.md,
    },
    compactInfo: {
      flex: 1,
    },
    compactTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Layout.spacing.xs,
    },
    compactYear: {
      fontSize: 14,
      color: colors.textSecondary,
    },

    // Detailed variant
    detailedCard: {
      marginBottom: Layout.spacing.lg,
    },
    posterContainer: {
      alignItems: 'center',
      marginBottom: Layout.spacing.lg,
    },
    poster: {
      width: Layout.window.width * 0.8,
      height: Layout.poster.height,
      borderRadius: Layout.poster.borderRadius,
      backgroundColor: colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    posterImage: {
      width: '100%',
      height: '100%',
      borderRadius: Layout.poster.borderRadius,
    },
    posterText: {
      color: colors.textMuted,
      fontSize: 16,
      marginTop: Layout.spacing.sm,
    },
    content: {
      marginBottom: Layout.spacing.lg,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: Layout.spacing.sm,
    },
    year: {
      fontSize: 18,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Layout.spacing.lg,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Layout.spacing.sm,
      paddingHorizontal: Layout.spacing.md,
    },
    detailText: {
      fontSize: 16,
      color: colors.textSecondary,
      marginLeft: Layout.spacing.sm,
      flex: 1,
    },
    description: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginTop: Layout.spacing.lg,
      paddingHorizontal: Layout.spacing.md,
    },
    actions: {
      gap: Layout.spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Layout.spacing.md,
      paddingHorizontal: Layout.spacing.lg,
      borderRadius: Layout.borderRadius.lg,
      gap: Layout.spacing.sm,
    },
    primaryAction: {
      backgroundColor: colors.primary,
    },
    primaryActionText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
    secondaryAction: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    secondaryActionText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
  });
