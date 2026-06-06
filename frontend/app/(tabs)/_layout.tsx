import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: COLORS.primary,
          borderTopWidth: 2,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.primaryDark,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontFamily: 'Nunito_700Bold',
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="trade"
        options={{
          title: 'Trade',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🐾' : '🐾'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="stickerdex"
        options={{
          title: 'Stickerdex',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '📖' : '📖'}</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="skins"
        options={{
          title: 'Skins',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '✨' : '✨'}</Text>
          ),
        }}
      />
    </Tabs>
  );
}
