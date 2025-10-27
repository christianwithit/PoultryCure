import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

export default function SymptomInput() {
  const [symptoms, setSymptoms] = useState('');
  const router = useRouter();

  const diagnose = async () => {
    if (!symptoms.trim()) {
      Alert.alert('Error', 'Please enter some symptoms.');
      return;
    }

    // Simple mock diagnosis logic
    let diagnosis = 'Healthy';
    if (symptoms.toLowerCase().includes('cough')) diagnosis = 'Respiratory Infection';
    if (symptoms.toLowerCase().includes('diarrhea')) diagnosis = 'Newcastle Disease';
    if (symptoms.toLowerCase().includes('swelling')) diagnosis = 'Fowl Cholera';

    const result = { type: 'symptom', input: symptoms, diagnosis, date: new Date().toISOString() };
    await AsyncStorage.setItem('lastDiagnosis', JSON.stringify(result));
    router.push({ pathname: '/diagnosis-result', params: { diagnosis } });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🧪 Symptom Diagnosis</Text>
      <Text style={styles.subtitle}>Describe the symptoms your bird is showing.</Text>

      <TextInput
        style={styles.input}
        placeholder="e.g. coughing, loss of appetite..."
        value={symptoms}
        onChangeText={setSymptoms}
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={diagnose}>
        <Ionicons name="search" size={22} color="#fff" />
        <Text style={styles.buttonText}>Analyze</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 10,
  },
  subtitle: {
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
  },
});
