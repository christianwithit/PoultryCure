import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from '../constants/theme';

interface LoadingButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  loadingText?: string;
}

export function LoadingButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  style,
  loadingText,
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;

  const getButtonStyle = () => {
    return [
      styles.button,
      styles[size],
      variant === 'primary' && styles.primary,
      variant === 'primary' && isDisabled && styles.primaryDisabled,
      variant === 'secondary' && styles.secondary,
      variant === 'secondary' && isDisabled && styles.secondaryDisabled,
      variant === 'outline' && styles.outline,
      variant === 'outline' && isDisabled && styles.outlineDisabled,
    ].filter(Boolean);
  };

  const getTextStyle = () => {
    return [
      styles.text,
      styles[`${size}Text` as keyof typeof styles],
      variant === 'primary' && styles.primaryText,
      variant === 'secondary' && styles.secondaryText,
      variant === 'outline' && styles.outlineText,
      variant === 'outline' && isDisabled && styles.outlineTextDisabled,
    ].filter(Boolean);
  };

  const getLoadingColor = () => {
    switch (variant) {
      case 'primary':
        return COLORS.white;
      case 'secondary':
        return COLORS.white;
      case 'outline':
        return COLORS.primary;
      default:
        return COLORS.white;
    }
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <>
          <ActivityIndicator 
            size="small" 
            color={getLoadingColor()} 
            style={styles.loadingIndicator}
          />
          {loadingText && (
            <Text style={getTextStyle()}>{loadingText}</Text>
          )}
        </>
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  
  // Sizes
  small: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    minHeight: 36,
  },
  medium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    minHeight: 44,
  },
  large: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    minHeight: 52,
  },

  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  primaryDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  secondaryDisabled: {
    backgroundColor: COLORS.textMuted,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  outlineDisabled: {
    borderColor: COLORS.textMuted,
  },

  // Text styles
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: FONT_SIZES.sm,
  },
  mediumText: {
    fontSize: FONT_SIZES.md,
  },
  largeText: {
    fontSize: FONT_SIZES.lg,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.white,
  },
  outlineText: {
    color: COLORS.primary,
  },
  outlineTextDisabled: {
    color: COLORS.textMuted,
  },

  loadingIndicator: {
    marginRight: SPACING.sm,
  },
});