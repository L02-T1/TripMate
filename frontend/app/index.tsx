import { Redirect } from 'expo-router';
import { useApp } from '../context/AppContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, loading } = useApp();
  
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1B4F8A' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  
  if (user) return <Redirect href="/(tabs)/trips" />;
  return <Redirect href="/onboarding" />;
}
