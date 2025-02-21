import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PlayerProvider } from '../src/context/PlayerContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <PlayerProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="game" />
        </Stack>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
