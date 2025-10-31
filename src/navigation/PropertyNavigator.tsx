import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'
import { AddAccountScreen } from '../screens/financial'
import {
  AddActivityScreen,
  AddCoffeeScreen,
  AddPlotScreen,
} from '../screens/harvest'
import {
  AddPropertyScreen,
  EditPropertyScreen,
  SelectPropertyScreen,
} from '../screens/property'
import { CoffeeDetailScreen } from '../screens/tabs/CoffeeDetailScreen'
import { PlotDetailScreen } from '../screens/tabs/PlotDetailScreen'
import { PropertyStackParamList } from '../types/navigation'
import { PropertyTabs } from './PropertyTabs'

const Stack = createNativeStackNavigator<PropertyStackParamList>()

export function PropertyNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        fullScreenGestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="SelectProperty"
        component={SelectPropertyScreen}
        options={{
          title: 'Selecionar Propriedade',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AddProperty"
        component={AddPropertyScreen}
        options={{
          title: 'Nova Propriedade',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="EditProperty"
        component={EditPropertyScreen}
        options={{
          title: 'Editar Propriedade',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="PropertyTabs"
        component={PropertyTabs}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CoffeeDetail"
        component={CoffeeDetailScreen}
        options={{
          title: 'Detalhes do Café',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="PlotDetail"
        component={PlotDetailScreen}
        options={{
          title: 'Detalhes do Talhão',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{
          title: 'Nova Conta',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="AddCoffee"
        component={AddCoffeeScreen as any}
        options={{
          title: 'Novo Tipo de Café',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="AddPlot"
        component={AddPlotScreen as any}
        options={{
          title: 'Novo Talhão',
          headerBackTitle: 'Voltar',
        }}
      />
      <Stack.Screen
        name="AddActivity"
        component={AddActivityScreen as any}
        options={{
          title: 'Nova Atividade',
          headerBackTitle: 'Voltar',
        }}
      />
    </Stack.Navigator>
  )
}
