// app/(tabs)/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from '../../constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const navigateToSymptom = () => {
    router.push('/diagnosis/symptom-input');
  };

  const navigateToImage = () => {
    router.push('/diagnosis/image-diagnosis');
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={50} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>🐔 PoultryCure</Text>
        <Text style={styles.subtitle}>
          AI-powered poultry disease diagnosis and management system
        </Text>
        <Text style={styles.description}>
          Quickly identify diseases through symptom analysis or image recognition
        </Text>
      </Animated.View>

      <Animated.View 
        style={[
          styles.buttonsContainer,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={navigateToSymptom}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Symptom diagnosis"
          accessibilityHint="Diagnose diseases by describing symptoms"
        >
          <View style={styles.buttonIconContainer}>
            <Ionicons name="pulse-outline" size={28} color={COLORS.white} />
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Symptom Diagnosis</Text>
            <Text style={styles.buttonSubtitle}>Describe what you observe</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={navigateToImage}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel="Image diagnosis"
          accessibilityHint="Diagnose diseases by uploading photos"
        >
          <View style={styles.buttonIconContainer}>
            <Ionicons name="camera-outline" size={28} color={COLORS.white} />
          </View>
          <View style={styles.buttonTextContainer}>
            <Text style={styles.buttonTitle}>Image Diagnosis</Text>
            <Text style={styles.buttonSubtitle}>Take or upload photos</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </Animated.View>

      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.success} />
          <Text style={styles.infoText}>Accurate AI Analysis</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="flash" size={24} color={COLORS.warning} />
          <Text style={styles.infoText}>Quick Results</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="book" size={24} color={COLORS.secondary} />
          <Text style={styles.infoText}>Expert Knowledge</Text>
        </View>
      </View>

      <Text style={styles.disclaimer}>
        ⚠️ This app provides preliminary diagnosis. Always consult a veterinarian for proper treatment.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? SPACING.xxl : SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: FONT_SIZES.hero,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  buttonsContainer: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.small,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonIconContainer: {
    marginRight: SPACING.md,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginBottom: 2,
  },
  buttonSubtitle: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    opacity: 0.9,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  infoCard: {
    alignItems: 'center',
    flex: 1,
  },
  infoText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  disclaimer: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});