import { MaterialIcons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ImageDiagnosis() {
  const [image, setImage] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const cam = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cam.status === 'granted');

      const gallery = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (gallery.status !== 'granted') Alert.alert('Permission needed', 'Please allow access to photos');
    })();
  }, []);

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Image Diagnosis</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, { backgroundColor: '#34A853' }]} onPress={takePhoto}>
          <MaterialIcons name="camera-alt" size={24} color="white" />
          <Text style={styles.buttonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, { backgroundColor: '#F4B400' }]} onPress={pickImage}>
          <MaterialIcons name="photo-library" size={24} color="white" />
          <Text style={styles.buttonText}>Pick from Gallery</Text>
        </TouchableOpacity>
      </View>

      {image && <Image source={{ uri: image }} style={styles.image} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, color: '#34A853' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: { color: '#fff', fontSize: 16, marginLeft: 8, fontWeight: 'bold' },
  image: { width: 300, height: 300, marginTop: 20, borderRadius: 10 },
});
