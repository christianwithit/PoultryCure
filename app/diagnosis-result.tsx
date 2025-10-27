import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DiagnosisResult() {
  const { diagnosis } = useLocalSearchParams<{ diagnosis: string }>();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="medkit-outline" size={60} color="#2e7d32" />
      <Text style={styles.title}>Diagnosis Result</Text>
      <Text style={styles.result}>{diagnosis || 'No result found'}</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/')}>
        <Ionicons name="home-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 10, color: '#2e7d32' },
  result: { fontSize: 20, color: '#333', textAlign: 'center', marginVertical: 20 },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2e7d32',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, marginLeft: 8 },
});
