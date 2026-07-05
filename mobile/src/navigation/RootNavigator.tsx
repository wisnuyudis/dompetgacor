import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { TabNavigator } from './TabNavigator';
import { TransferScreen } from '../screens/TransferScreen';
import { TopUpScreen } from '../screens/TopUpScreen';
import { MyQRScreen } from '../screens/MyQRScreen';
import { ScanScreen } from '../screens/ScanScreen';
import { PayConfirmScreen } from '../screens/PayConfirmScreen';
import { SuccessScreen } from '../screens/SuccessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Transfer" component={TransferScreen} />
            <Stack.Screen name="TopUp" component={TopUpScreen} />
            <Stack.Screen name="MyQR" component={MyQRScreen} />
            <Stack.Screen name="Scan" component={ScanScreen} />
            <Stack.Screen name="PayConfirm" component={PayConfirmScreen} />
            <Stack.Screen
              name="Success"
              component={SuccessScreen}
              options={{ presentation: 'modal', gestureEnabled: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
