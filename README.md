# Cafetec App

Coffee property management application built with React Native and Expo.

## Project Structure

```
cafetec-app/
├── src/
│   ├── App.tsx                     # Main app component with providers
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication state management
│   ├── navigation/
│   │   ├── RootNavigator.tsx       # Root navigation (Auth/Property switch)
│   │   ├── AuthNavigator.tsx       # Auth stack (Login, SignUp)
│   │   ├── PropertyNavigator.tsx   # Property stack (SelectProperty, Tabs, Details)
│   │   ├── PropertyTabs.tsx        # Bottom tab navigator
│   │   └── index.ts
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx     # Login screen (public)
│   │   │   ├── SignUpScreen.tsx    # Sign up screen (public)
│   │   │   └── index.ts
│   │   ├── property/
│   │   │   ├── SelectPropertyScreen.tsx  # Property selection (private)
│   │   │   └── index.ts
│   │   └── tabs/
│   │       ├── HomeScreen.tsx            # Home tab
│   │       ├── FinancialScreen.tsx       # Financial tab
│   │       ├── HarvestScreen.tsx         # Harvest tab
│   │       ├── ProductionScreen.tsx      # Production tab
│   │       ├── CoffeeDetailScreen.tsx    # Coffee detail (modal)
│   │       ├── PlotDetailScreen.tsx      # Plot detail (modal)
│   │       └── index.ts
│   └── types/
│       └── navigation.ts           # Navigation type definitions
├── index.ts                        # App entry point
├── package.json
└── tsconfig.json
```

## Navigation Flow

### Public Screens (Unauthenticated)

1. **LoginScreen** - User authentication
2. **SignUpScreen** - New user registration

### Private Screens (Authenticated)

1. **SelectPropertyScreen** - Choose a property to manage
2. **PropertyTabs** - Main dashboard with 4 tabs:
   - **Home** - Property overview and quick stats
   - **Financial** - Revenue, expenses, and profit
   - **Harvest** - Harvest management and status
   - **Production** - Production metrics and quality
3. **CoffeeDetailScreen** - Detailed information about specific coffee type (modal)
4. **PlotDetailScreen** - Detailed information about specific plot (modal)

## Navigation Architecture

```
RootNavigator
├── Auth (Stack)
│   ├── Login
│   └── SignUp
└── Property (Stack)
    ├── SelectProperty
    ├── PropertyTabs (Bottom Tabs)
    │   ├── Home
    │   ├── Financial
    │   ├── Harvest
    │   └── Production
    ├── CoffeeDetail (Modal)
    └── PlotDetail (Modal)
```

## Key Features

- **React Navigation 6** - Modern navigation with TypeScript
- **Stack Navigation** - For screen hierarchy
- **Tab Navigation** - For main property management sections
- **Nested Navigation** - Tabs nested within stacks
- **Modal Screens** - Detail screens presented as modals from tabs
- **Authentication Flow** - Conditional rendering based on auth state
- **Type Safety** - Full TypeScript support with navigation types

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm start
```

### Run on specific platform

```bash
npm run android
npm run ios
npm run web
```

## Technologies

- **React Native** - Mobile app framework
- **Expo** - Development and build tools
- **React Navigation** - Navigation library
  - `@react-navigation/native` - Core navigation
  - `@react-navigation/native-stack` - Stack navigator
  - `@react-navigation/bottom-tabs` - Tab navigator
- **TypeScript** - Type safety
- **React Context** - State management

## Next Steps

- [ ] Implement real authentication API
- [ ] Add data fetching for properties
- [ ] Implement property context/state management
- [ ] Add form validation
- [ ] Implement loading states
- [ ] Add error handling
- [ ] Create reusable UI components
- [ ] Add icons to tab navigator
- [ ] Implement dark mode
- [ ] Add unit tests
