import { Layout } from '../constants/Layout';
import { useTheme } from '../context/ThemeContext';
import { useVideo } from '../context/VideoContext';
import { VideoResult, RootStackParamList } from '../types';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Button, IconButton, VideoResultCard } from '../components';

export default function HistoryScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { identificationHistory, clearIdentificationHistory, setCurrentIdentification } = useVideo();
  const { colors } = useTheme();

  const handleItemPress = (item: VideoResult) => {
    setCurrentIdentification(item);
    navigation.navigate('Results', { videoResult: item });
  };

  const handleClearHistory = () => {
    clearIdentificationHistory();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStartIdentifying = () => {
    navigation.navigate('Camera');
  };

  const renderHistoryItem = ({ item }: { item: VideoResult }) => (
    <VideoResultCard
      video={item}
      variant="compact"
      showActions={false}
      onPress={() => handleItemPress(item)}
    />
  );

  return (
    <LinearGradient
      colors={colors.backgroundGradient}
      style={styles(colors).container}
    >
      {/* Header */}
      <View style={styles(colors).header}>
        <IconButton icon="arrow-back" onPress={handleBack} variant="default" />
        <Text style={styles(colors).title}>History</Text>
        <IconButton
          icon="trash"
          onPress={handleClearHistory}
          variant="secondary"
        />
      </View>

      {/* Content */}
      {identificationHistory.length === 0 ? (
        <View style={styles(colors).emptyState}>
          <Ionicons name="time-outline" size={64} color={colors.textMuted} />
          <Text style={styles(colors).emptyTitle}>No History Yet</Text>
          <Text style={styles(colors).emptySubtitle}>
            Your identified videos will appear here
          </Text>
          <Button
            title="Start Identifying"
            onPress={handleStartIdentifying}
            icon="videocam"
            size="large"
          />
        </View>
      ) : (
        <FlatList
          data={identificationHistory}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles(colors).listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: Layout.spacing.lg,
      paddingTop: Layout.spacing.xxl,
      paddingBottom: Layout.spacing.md,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      flex: 1,
    },
    clearButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.overlayLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContainer: {
      paddingHorizontal: Layout.spacing.lg,
      paddingBottom: Layout.spacing.xl,
    },
    historyItem: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: Layout.borderRadius.lg,
      padding: Layout.spacing.md,
      marginBottom: Layout.spacing.md,
    },
    thumbnail: {
      width: 60,
      height: 80,
      borderRadius: Layout.borderRadius.md,
      backgroundColor: colors.surfaceLight,
      marginRight: Layout.spacing.md,
      position: 'relative',
      overflow: 'hidden',
    },
    thumbnailPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sourceBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemContent: {
      flex: 1,
      justifyContent: 'space-between',
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: Layout.spacing.xs,
    },
    itemDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Layout.spacing.xs,
    },
    itemYear: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: Layout.spacing.sm,
    },
    itemGenre: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    itemTime: {
      fontSize: 12,
      color: colors.textMuted,
    },
    arrowContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 24,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Layout.spacing.lg,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginTop: Layout.spacing.lg,
      marginBottom: Layout.spacing.sm,
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Layout.spacing.xl,
      lineHeight: 24,
    },
    identifyButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Layout.spacing.lg,
      paddingVertical: Layout.spacing.md,
      borderRadius: Layout.borderRadius.lg,
    },
    identifyButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
