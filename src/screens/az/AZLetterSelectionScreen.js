import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { vocabularySets } from '../../data/vocabulary';
import { useSubscription } from '../../context/SubscriptionContext';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

// Get all unique letters that have words
const getAvailableLetters = () => {
  const allWords = vocabularySets
    .filter(set => set.id !== 0 && !set.isMixed)
    .flatMap(set => set.words);
  
  const letterSet = new Set();
  allWords.forEach(word => {
    const firstLetter = word.word.charAt(0).toUpperCase();
    if (firstLetter.match(/[A-Z]/)) {
      letterSet.add(firstLetter);
    }
  });
  
  return Array.from(letterSet).sort();
};

// Animated Letter Button Component
const AnimatedLetterButton = ({ letter, onPress, delay, wordCount }) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.letterButtonContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity 
        style={styles.letterButton}
        onPress={() => onPress(letter)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={styles.letterGradient}
        >
          <Text style={styles.letterText}>{letter}</Text>
          <Text style={styles.wordCountBadge}>{wordCount}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AZLetterSelectionScreen({ navigation }) {
  const { isPremium } = useSubscription();
  const [availableLetters, setAvailableLetters] = useState([]);
  const [letterCounts, setLetterCounts] = useState({});

  // Check subscription on mount
  useEffect(() => {
    if (!isPremium) {
      // Navigate to parent (Main) then to SettingsTab -> Subscription
      navigation.getParent()?.navigate('SettingsTab', { screen: 'Subscription' });
      return;
    }
  }, [isPremium]);

  useEffect(() => {
    const letters = getAvailableLetters();
    setAvailableLetters(letters);
    
    // Calculate word count for each letter
    const counts = {};
    const allWords = vocabularySets
      .filter(set => set.id !== 0 && !set.isMixed)
      .flatMap(set => set.words);
    
    letters.forEach(letter => {
      counts[letter] = allWords.filter(word => 
        word.word.charAt(0).toUpperCase() === letter
      ).length;
    });
    
    setLetterCounts(counts);
  }, []);

  const handleLetterPress = (letter) => {
    navigation.navigate('AZWordList', { letter });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.learning} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.badgeContainer}>
                <View style={styles.glowEffect} />
                <LinearGradient
                  colors={['#a808d8ff', '#4d25eba9']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.headerBadge}
                >
                  <Text style={styles.headerBadgeText}>🔤 A-Z WORD BROWSER</Text>
                </LinearGradient>
              </View>

              {/* Instructions Card */}
              <View style={styles.instructionsCard}>
                <Text style={styles.instructionsTitle}>📖 Browse 11+ Words by Letter:</Text>
                <Text style={styles.instructionsText}>
                  Choose any letter below to explore all 11+ vocabulary words starting with that letter!
                </Text>
              </View>
            </View>

            {/* Letters Grid */}
            <View style={styles.lettersGrid}>
              {availableLetters.map((letter, index) => (
                <AnimatedLetterButton
                  key={letter}
                  letter={letter}
                  onPress={handleLetterPress}
                  delay={index * 30}
                  wordCount={letterCounts[letter] || 0}
                />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 2,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xs,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -25 }],
    width: 200,
    height: 50,
    backgroundColor: 'n #3b82f6',
    opacity: 0.3,
    borderRadius: 25,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
  },
  headerBadge: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBadgeText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  instructionsTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  instructionsText: {
    fontSize: fontSize.base,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  letterButtonContainer: {
    width: '18%',
    aspectRatio: 1,
    marginBottom: spacing.sm,
  },
  letterButton: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  letterGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  letterText: {
    fontSize: 32,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  wordCountBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(6, 3, 98, 0.62)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.white,
    minWidth: 20,
    textAlign: 'center',
  },
});
