import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { AppError, ErrorHandler, ErrorType } from '../utils/errorHandling';

interface ErrorDisplayProps {
  error: AppError | Error | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: any;
}

export function ErrorDisplay({ error, onRetry, onDismiss, style }: ErrorDisplayProps) {
  if (!error) return null;

  const appError = typeof error === 'string' || error instanceof Error 
    ? ErrorHandler.mapError(error) 
    : error;

  const getErrorIcon = () => {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return 'wifi-outline';
      case ErrorType.AUTHENTICATION:
        return 'lock-closed-outline';
      case ErrorType.VALIDATION:
        return 'alert-circle-outline';
      case ErrorType.STORAGE:
        return 'save-outline';
      case ErrorType.PERMISSION:
        return 'shield-outline';
      default:
        return 'warning-outline';
    }
  };

  const getErrorColor = () => {
    switch (appError.type) {
      case ErrorType.NETWORK:
        return COLORS.warning;
      case ErrorType.VALIDATION:
        return COLORS.warning;
      default:
        return COLORS.error;
    }
  };

  return (
    <View style={[styles.container, { borderColor: getErrorColor() }, style]}>
      <View style={styles.header}>
        <Ionicons 
          name={getErrorIcon()} 
          size={20} 
          color={getErrorColor()} 
          style={styles.icon}
        />
        <Text style={[styles.message, { color: getErrorColor() }]}>
          {ErrorHandler.getUserMessage(appError)}
        </Text>
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
            <Ionicons name="close" size={16} color={getErrorColor()} />
          </TouchableOpacity>
        )}
      </View>
      
      {ErrorHandler.isRetryable(appError) && onRetry && (
        <TouchableOpacity 
          style={[styles.retryButton, { borderColor: getErrorColor() }]} 
          onPress={onRetry}
        >
          <Ionicons name="refresh" size={16} color={getErrorColor()} />
          <Text style={[styles.retryText, { color: getErrorColor() }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  message: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
  },
  dismissButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
  },
  retryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginLeft: SPACING.xs,
  },
});