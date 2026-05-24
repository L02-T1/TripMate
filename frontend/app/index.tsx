import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useApp } from '../context/AppContext';

const ONBOARDING_DONE_KEY = 'tripmate_onboarding_done';

export default function Index() {
  const { user, loading } = useApp();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_DONE_KEY).then(val => {
      setOnboardingDone(val === 'true');
      setCheckingOnboarding(false);
    });
  }, []);

  if (loading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B4F8A' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (user) return <Redirect href="/(tabs)/trips" />;
  if (!onboardingDone) return <Redirect href="/onboarding" />;
  return <Redirect href="/(auth)/sign-in" />;
}
