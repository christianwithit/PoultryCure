import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="edit" 
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen 
        name="change-password" 
        options={{
          title: 'Change Password',
        }}
      />
    </Stack>
  );
}