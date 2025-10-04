import { MaterialIcons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import React from 'react'
import { FinancialScreen } from '../screens/tabs/FinancialScreen'
import { HarvestScreen } from '../screens/tabs/HarvestScreen'
import { HomeScreen } from '../screens/tabs/HomeScreen'
import { ProductionScreen } from '../screens/tabs/ProductionScreen'
import { ProfileScreen } from '../screens/tabs/ProfileScreen'
import { PropertyTabsParamList } from '../types/navigation'

const Tab = createBottomTabNavigator<PropertyTabsParamList>()

export function PropertyTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6B4226',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Financial"
        component={FinancialScreen}
        options={{
          tabBarLabel: 'Financeiro',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="attach-money" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Harvest"
        component={HarvestScreen}
        options={{
          tabBarLabel: 'Colheita',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="grain" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Production"
        component={ProductionScreen}
        options={{
          tabBarLabel: 'Produção',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons
              name="production-quantity-limits"
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
