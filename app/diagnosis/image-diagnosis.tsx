// app/diagnosis/image-diagnosis.tsx
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BORDER_RADIUS, COLORS, FONT_SIZES, SHADOWS, SPACING } from '../../constants/theme';
import { useDiagnosis } from '../../contexts/DiagnosisContext';
import { DiagnosisAPI } from '../../services/api';

export default function ImageDiagnosis() {
  const [image, setImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addDiagnosis } = useDiagnosis();

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const cameraResponse = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraResponse.status === 'granted');

      const galleryResponse = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasGalleryPermission(galleryResponse.status === 'granted');

      if (galleryResponse.status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please allow access to your photo library to use this feature.'
        );
      }

      if (cameraResponse.status !== 'granted') {
        Alert.alert(
          'Permission Needed',
          'Please allow camera access to take photos.'
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request permissions.');
    }
  };

  const takePhoto = async () => {
    try {
      if (hasCameraPermission === false) {
        Alert.alert(
          'Camera Permission Required',
          'Please grant camera permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Camera.requestCameraPermissionsAsync() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to open camera. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      if (hasGalleryPermission === false) {
        Alert.alert(
          'Gallery Permission Required',
          'Please grant photo library permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => ImagePicker.requestMediaLibraryPermissionsAsync() },
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to open gallery. Please try again.');
    }
  };

  const analyzeImage = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please take or select a photo first.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await DiagnosisAPI.analyzeImage(image);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Analysis failed');
      }

      await addDiagnosis(response.data);

      router.push({
        pathname: '/diagnosis/result',
        params: { diagnosisId: response.data.id },
      });
    } catch (error) {
      console.error('Image analysis error:', error);
      Alert.alert(
        'Analysis Failed',
        'Failed to analyze image. Please try again or use symptom diagnosis.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const retakePhoto = () => {
    setImage(null);
    setTimeout(takePhoto, 100);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="camera" size={40} color={COLORS.secondary} />
        </View>
        <Text style={styles.title}>📸 Image Diagnosis</Text>
        <Text style={styles.subtitle}>
          Take or upload a clear photo of the affected bird
        </Text>
      </View>

      {!image ? (
        <>
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Photo Guidelines:</Text>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.instructionText}>Good lighting</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.instructionText}>Clear focus on affected area</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.instructionText}>Close-up if possible</Text>
            </View>
            <View style={styles.instructionItem}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
              <Text style={styles.instructionText}>Multiple angles help</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cameraButton]}
              onPress={takePhoto}
              activeOpacity={0.8}
              disabled={hasCameraPermission === false}
              accessible={true}
              accessibilityLabel="Take photo"
              accessibilityHint="Opens camera to take a photo"
            >
              <MaterialIcons name="camera-alt" size={28} color={COLORS.white} />
              <Text style={styles.buttonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.galleryButton]}
              onPress={pickImage}
              activeOpacity={0.8}
              disabled={hasGalleryPermission === false}
              accessible={true}
              accessibilityLabel="Pick from gallery"
              accessibilityHint="Opens gallery to select a photo"
            >
              <MaterialIcons name="photo-library" size={28} color={COLORS.white} />
              <Text style={styles.buttonText}>Pick from Gallery</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={[styles.imageActionButton, styles.removeButton]}
              onPress={removeImage}
              disabled={isLoading}
            >
              <Ionicons name="trash-outline" size={20} color={COLORS.white} />
              <Text style={styles.imageActionText}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageActionButton, styles.retakeButton]}
              onPress={retakePhoto}
              disabled={isLoading}
            >
              <Ionicons name="camera-reverse-outline" size={20} color={COLORS.white} />
              <Text style={styles.imageActionText}>Retake</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.analyzeButton, isLoading && styles.analyzeButtonDisabled]}
            onPress={analyzeImage}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color={COLORS.white} />
                <Text style={styles.analyzeButtonText}>Analyzing Image...</Text>
              </>
            ) : (
              <>
                <Ionicons name="analytics" size={22} color={COLORS.white} />
                <Text style={styles.analyzeButtonText}>Analyze Image</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            ℹ️ Image analysis uses AI to identify visual symptoms
          </Text>
        </View>
      )}

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color={COLORS.warning} />
        <Text style={styles.infoText}>
          For best results, combine image diagnosis with symptom description
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.small,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },
  instructionsContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.small,
  },
  instructionsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  instructionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginLeft: SPACING.sm,
  },
  buttonContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.medium,
  },
  cameraButton: {
    backgroundColor: COLORS.success,
  },
  galleryButton: {
    backgroundColor: COLORS.warning,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    marginLeft: SPACING.sm,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  image: {
    width: '100%',
    height: 350,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  imageActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  removeButton: {
    backgroundColor: COLORS.error,
  },
  retakeButton: {
    backgroundColor: COLORS.secondary,
  },
  imageActionText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  analyzeButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: SPACING.md,
    ...SHADOWS.medium,
  },
  analyzeButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    opacity: 0.6,
  },
  analyzeButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  note: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginLeft: SPACING.sm,
    lineHeight: 18,
  },
});