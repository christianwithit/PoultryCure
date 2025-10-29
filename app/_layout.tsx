// app/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';
import { DiagnosisProvider } from '../contexts/DiagnosisContext';

export default function RootLayout() {
  return (
    <DiagnosisProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="diagnosis" 
          options={{ 
            headerShown: false,
            presentation: 'card'
          }} 
        />
        <Stack.Screen 
          name="settings" 
          options={{ headerShown: false }} 
        />
      </Stack>
    </DiagnosisProvider>
  );
}