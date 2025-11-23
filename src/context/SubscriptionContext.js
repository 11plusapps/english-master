import React, { createContext, useState, useContext, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  // SET TO true FOR TESTING PREMIUM FEATURES
  const [isPremium, setIsPremium] = useState(true); // Changed from false to true
  const [loading, setLoading] = useState(true);

  // Load subscription status
  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('premium_status');
      setIsPremium(status === 'true');
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockPremium = async () => {
    try {
      await AsyncStorage.setItem('premium_status', 'true');
      setIsPremium(true);
    } catch (error) {
      console.error('Error unlocking premium:', error);
    }
  };

  const lockPremium = async () => {
    try {
      await AsyncStorage.setItem('premium_status', 'false');
      setIsPremium(false);
    } catch (error) {
      console.error('Error locking premium:', error);
    }
  };

  // Check if a category is locked
  const isCategoryLocked = (categoryId, type = 'learning') => {
    // First category is always free
    if (categoryId === 1) return false;
    
    // If premium, nothing is locked
    if (isPremium) return false;
    
    // Otherwise, it's locked
    return true;
  };

  // Check if mixed practice is locked
  const isMixedLocked = () => {
    return !isPremium;
  };

  // Check if fun games are locked
  const areFunGamesLocked = () => {
    return !isPremium;
  };

  // Check if mock tests are locked
  const areMockTestsLocked = () => {
    return !isPremium;
  };

  const value = {
    isPremium,
    loading,
    unlockPremium,
    lockPremium,
    isCategoryLocked,
    isMixedLocked,
    areFunGamesLocked,
    areMockTestsLocked,
  };

  // Show loading screen while checking subscription status
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});