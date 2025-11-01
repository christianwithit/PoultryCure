import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from '../constants/theme';
import { AccessibilityUtils } from '../utils/formValidation';

interface EnhancedTextInputProps extends TextInputProps {
  label: string;
  error?: string | null;
  hint?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: any;
  labelStyle?: any;
  loading?: boolean;
}

export const EnhancedTextInput = forwardRef<TextInput, EnhancedTextInputProps>(
  (
    {
      label,
      error,
      hint,
      required = false,
      showPasswordToggle = false,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      inputStyle,
      labelStyle,
      loading = false,
      secureTextEntry,
      ...textInputProps
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isSecureEntry = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

    const handlePasswordToggle = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const handleFocus = (e: any) => {
      setIsFocused(true);
      textInputProps.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      textInputProps.onBlur?.(e);
    };

    const getInputContainerStyle = () => {
      return [
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        loading && styles.inputContainerLoading,
      ].filter(Boolean);
    };

    const accessibilityProps = AccessibilityUtils.getFieldAccessibilityProps(
      label,
      error,
      hint
    );

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {hint && !error && (
            <Text style={styles.hint}>{hint}</Text>
          )}
        </View>

        {/* Input Container */}
        <View style={getInputContainerStyle()}>
          {/* Left Icon */}
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              <Ionicons
                name={leftIcon as any}
                size={20}
                color={isFocused ? COLORS.primary : COLORS.textMuted}
              />
            </View>
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={[styles.input, inputStyle]}
            secureTextEntry={isSecureEntry}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!loading}
            placeholderTextColor={COLORS.textMuted}
            {...accessibilityProps}
            {...textInputProps}
          />

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.rightIconContainer}>
              <Ionicons
                name="hourglass-outline"
                size={20}
                color={COLORS.textMuted}
              />
            </View>
          )}

          {/* Password Toggle */}
          {showPasswordToggle && !loading && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={handlePasswordToggle}
              {...AccessibilityUtils.getButtonAccessibilityProps(
                isPasswordVisible ? 'Hide password' : 'Show password'
              )}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          )}

          {/* Right Icon */}
          {rightIcon && !showPasswordToggle && !loading && (
            <TouchableOpacity
              style={styles.rightIconContainer}
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
            >
              <Ionicons
                name={rightIcon as any}
                size={20}
                color={isFocused ? COLORS.primary : COLORS.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <Text
            style={styles.errorText}
            {...AccessibilityUtils.getErrorAccessibilityProps(error)}
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

EnhancedTextInput.displayName = 'EnhancedTextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  labelContainer: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  required: {
    color: COLORS.error,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  inputContainerLoading: {
    opacity: 0.7,
  },
  leftIconContainer: {
    paddingLeft: SPACING.md,
    paddingRight: SPACING.sm,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 44, // Minimum touch target size
  },
  rightIconContainer: {
    paddingLeft: SPACING.sm,
    paddingRight: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});