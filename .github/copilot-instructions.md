# Copilot Instructions - Mobile App (React Native)

## Project Overview

React Native mobile app for **Parking Management System** end users (clients). Provides parking search, reservation, and payment functionality.

## Architecture Patterns

### Navigation Structure
```typescript
// React Navigation v7 with bottom tabs
@react-navigation/bottom-tabs
@react-navigation/native-stack

// Typical user flow:
// Login → Map Search → Parking Details → Reservation → Payment
```

### Project Structure
```
src/
├── components/    # Reusable UI components
├── screens/       # Screen components (Login, Map, Reservations, etc.)
├── hooks/         # Custom hooks for API calls
└── lib/          # Utilities and API client
```

## Key Dependencies

- **React Native 0.76.5**: Core framework
- **React Navigation 7**: Navigation system
- **React Native Vector Icons**: Icon library
- **React Native Linear Gradient**: UI gradients
- **React Native Safe Area Context**: Screen layout handling

## Development Commands

```bash
# Start Metro bundler
npm start

# Run on platforms
npm run android    # Android development
npm run ios        # iOS development (macOS only)

# Testing & linting
npm test          # Jest tests
npm run lint      # ESLint
```

## Platform Setup

### Android
```bash
# Build and run
cd android && ./gradlew clean && cd .. && npm run android
```

### iOS
```bash
# Install pods and run
cd ios && pod install && cd .. && npm run ios
```

## Integration Points

### API Communication
- **Base URL**: Should match backend API (`api-nodejs-parking`)
- **Authentication**: JWT tokens for client users
- **Role**: Primarily `cliente` role functionality

### Expected Features
Based on parking system architecture:
- **User registration/login** (cliente role)
- **Parking location search** with map integration
- **Space reservation** system
- **Payment processing**
- **Reservation history**
- **Push notifications** for booking updates

## TypeScript Configuration

Project uses TypeScript with React Native:
- `tsconfig.json` configured for React Native
- Type-safe navigation with React Navigation
- Shared types with API backend (if applicable)

## Critical Patterns

1. **Client-focused**: Only implement features for `cliente` users
2. **Offline capability**: Consider local storage for critical data
3. **Real-time updates**: Integrate with backend for live parking availability
4. **Payment integration**: Secure payment flow with backend API
5. **Location services**: GPS integration for nearby parking search

When adding features, ensure they align with the client user journey and maintain secure communication with the backend API.