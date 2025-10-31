import { NavigatorScreenParams } from '@react-navigation/native'

// Auth Stack
export type AuthStackParamList = {
  Login: undefined
  SignUp: undefined
}

// Property Stack (after login)
export type PropertyStackParamList = {
  SelectProperty: undefined
  AddProperty: undefined
  EditProperty: { propertyId: string }
  PropertyTabs: NavigatorScreenParams<PropertyTabsParamList>
  CoffeeDetail: { id: string }
  PlotDetail: { id: string }
  AddAccount: undefined
  AddCoffee: undefined
  AddPlot: { coffeeId: string }
  AddActivity: { plotId: string }
}

// Property Tabs
export type PropertyTabsParamList = {
  Home: undefined
  Financial: undefined
  Harvest: undefined
  Production: undefined
  Profile: undefined
}

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>
  Property: NavigatorScreenParams<PropertyStackParamList>
}

declare global {
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
