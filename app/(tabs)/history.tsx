// app/(tabs)/history.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from '../../constants/theme';
import { useDiagnosis } from '../../contexts/DiagnosisContext';
import { DiagnosisResult } from '../../types/types';

export default function History() {
  const { history, clearHistory, deleteDiagnosis, isLoading } = useDiagnosis();
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all diagnosis records? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              Alert.alert('Success', 'All history has been cleared.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear history. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteItem = (id: string, diagnosis: string) => {
    Alert.alert(
      'Delete Record',
      `Delete diagnosis record for "${diagnosis}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDiagnosis(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete record. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (id: string) => {
    router.push({
      pathname: '/diagnosis/result',
      params: { diagnosisId: id },
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return COLORS.error;
      case 'moderate':
        return COLORS.warning;
      case 'low':
        return COLORS.success;
      default:
        return COLORS.textMuted;
    }
  };

  const renderHistoryItem = ({ item }: { item: DiagnosisResult }) => {
    const severityColor = getSeverityColor(item.severity);
    const date = new Date(item.date);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <TouchableOpacity
        style={styles.historyCard}
        onPress={() => handleViewDetails(item.id)}
        activeOpacity={0.7}
      >
        {item.imageUri && (
          <Image source={{ uri: item.imageUri }} style={styles.thumbnail} resizeMode="cover" />
        )}
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.typeIndicator}>
              <Ionicons
                name={item.type === 'symptom' ? 'pulse' : 'camera'}
                size={16}
                color={COLORS.white}
              />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.diagnosisName} numberOfLines={1}>
                {item.diagnosis}
              </Text>
              <Text style={styles.dateText}>
                {formattedDate} • {formattedTime}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteItem(item.id, item.diagnosis)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            </TouchableOpacity>
          </View>

          <Text style={styles.symptomsPreview} numberOfLines={2}>
            {item.input}
          </Text>

          <View style={styles.cardFooter}>
            <View style={[styles.severityBadge, { backgroundColor: `${severityColor}20` }]}>
              <Ionicons name="alert-circle" size={14} color={severityColor} />
              <Text style={[styles.severityText, { color: severityColor }]}>
                {item.severity.toUpperCase()}
              </Text>
            </View>
            
            <View style={styles.confidenceBadge}>
              <Ionicons name="speedometer-outline" size={14} color={COLORS.primary} />
              <Text style={styles.confidenceText}>{item.confidence}%</Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="document-text-outline" size={80} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No Diagnosis History</Text>
      <Text style={styles.emptyText}>
        Your diagnosis records will appear here once you start using the app.
      </Text>
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => (router as any).push('/(tabs)')}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle-outline" size={22} color={COLORS.white} />
        <Text style={styles.startButtonText}>Start New Diagnosis</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {history.length > 0 && (
        <View style={styles.actionsBar}>
          <Text style={styles.recordCount}>
            {history.length} {history.length === 1 ? 'record' : 'records'}
          </Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={history}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          history.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  recordCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  clearButtonText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    backgroundColor: COLORS.border,
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  typeIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerText: {
    flex: 1,
  },
  diagnosisName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  deleteButton: {
    padding: SPACING.xs,
  },
  symptomsPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  severityText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: `${COLORS.primary}20`,
    borderRadius: BORDER_RADIUS.sm,
  },
  confidenceText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.medium,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 22,
    paddingHorizontal: SPACING.lg,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  startButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
});