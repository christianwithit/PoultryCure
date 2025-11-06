import { EnhancedTextInput } from '@/components/EnhancedTextInput';
import { storageManager } from '@/services/storage';
import { AccessibilityUtils, KeyboardUtils, useAutoFocus } from '@/utils/formValidation';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ErrorDisplay } from '../../components/ErrorDisplay';
import { LoadingButton } from '../../components/LoadingButton';
import { SuccessMessage } from '../../components/SuccessMessage';
import { BORDER_RADIUS, COLORS, FONT_SIZES, LINE_HEIGHT, SHADOWS, SPACING } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { AppError, ErrorHandler } from '../../utils/errorHandling';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<AppError | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Refs for form navigation
  const emailRef = useAutoFocus();
  const passwordRef = useRef<TextInput>(null);
  
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setSuccessMessage(null);
      await login(data.email, data.password);
      setSuccessMessage('Login successful! Redirecting...');
      // Navigation will be handled by AuthGuard
    } catch (error) {
      const appError = ErrorHandler.mapError(error);
      setError(appError);
    }
  };

  const handleRetry = () => {
    setError(null);
  };

  const navigateToSignup = () => {
    router.push('/auth/signup');
  };

  const navigateToForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  // Debug function to clear storage
  const clearStorage = async () => {
    try {
      await storageManager.clearUserData();
      setSuccessMessage('Storage cleared! You can now create a new account.');
      setError(null);
    } catch (error) {
      const appError = ErrorHandler.mapError(error);
      setError(appError);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {error && (
            <ErrorDisplay 
              error={error} 
              onRetry={handleRetry}
              onDismiss={() => setError(null)}
            />
          )}

          {successMessage && (
            <SuccessMessage
              message={successMessage}
              visible={!!successMessage}
              onDismiss={() => setSuccessMessage(null)}
            />
          )}

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <EnhancedTextInput
                  ref={emailRef}
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  leftIcon="mail-outline"
                  loading={isLoading}
                  required
                  returnKeyType={KeyboardUtils.getReturnKeyType(false)}
                  onSubmitEditing={KeyboardUtils.handleReturnKey(false, passwordRef)}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Password is required',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <EnhancedTextInput
                  ref={passwordRef}
                  label="Password"
                  placeholder="Enter your password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  showPasswordToggle
                  leftIcon="lock-closed-outline"
                  loading={isLoading}
                  required
                  returnKeyType={KeyboardUtils.getReturnKeyType(true)}
                  onSubmitEditing={KeyboardUtils.handleReturnKey(true, undefined, handleSubmit(onSubmit))}
                />
              )}
            />

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={navigateToForgotPassword}
              disabled={isLoading}
              {...AccessibilityUtils.getButtonAccessibilityProps(
                'Forgot Password',
                isLoading
              )}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <LoadingButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              loadingText="Signing in..."
              style={styles.loginButton}
            />

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity
                onPress={navigateToSignup}
                disabled={isLoading}
              >
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Debug button - remove in production */}
            <TouchableOpacity
              style={styles.debugButton}
              onPress={clearStorage}
              disabled={isLoading}
            >
              <Text style={styles.debugButtonText}>Clear Storage (Debug)</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES.title * LINE_HEIGHT.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: FONT_SIZES.md * LINE_HEIGHT.sm,
  },
  form: {
    gap: SPACING.md,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: SPACING.xs,
  },
  forgotPasswordText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    lineHeight: FONT_SIZES.sm * LINE_HEIGHT.sm,
  },
  loginButton: {
    marginTop: SPACING.lg,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHT.sm,
  },
  signupText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    lineHeight: FONT_SIZES.sm * LINE_HEIGHT.sm,
  },
  signupLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    lineHeight: FONT_SIZES.sm * LINE_HEIGHT.sm,
  },
  debugButton: {
    marginTop: SPACING.xl,
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: 'center',
  },
  debugButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: FONT_SIZES.xs * LINE_HEIGHT.sm,
  },
});