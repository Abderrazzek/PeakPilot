import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Home, Coins, Award, Bot, User } from 'lucide-react-native';

import DashboardScreen from '../screens/Dashboard';
import TokenWalletScreen from '../screens/TokenWallet';
import BadgesScreen from '../screens/Badges';
import AIAssistantScreen from '../screens/AIAssistant';
import ProfileScreen from '../screens/Profile';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#3b82f6',
          tabBarInactiveTintColor: '#6b7280',
          tabBarStyle: {
            backgroundColor: '#111827',
            borderTopColor: '#1f2937',
            borderTopWidth: 1,
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
            tabBarLabel: 'Home',
          }}
        />
        <Tab.Screen
          name="TokenWallet"
          component={TokenWalletScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Coins color={color} size={size} />,
            tabBarLabel: 'Tokens',
          }}
        />
        <Tab.Screen
          name="Badges"
          component={BadgesScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Award color={color} size={size} />,
            tabBarLabel: 'Badges',
          }}
        />
        <Tab.Screen
          name="AIAssistant"
          component={AIAssistantScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Bot color={color} size={size} />,
            tabBarLabel: 'AI',
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
            tabBarLabel: 'Profile',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}


