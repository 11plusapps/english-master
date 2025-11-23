import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { storage } from '../../utils/storage';
import BackButton from '../../components/BackButton';
import { colors, gradients, spacing, fontSize, fontWeight } from '../../styles/theme';
import { vocabularySets } from '../../data/vocabulary';

export default function PracticeScreen({ route, navigation }) {
  const { setId } = route.params;
  const isMixed = setId === 'mixed';
  const isPracticeList = setId === 'practice-list';
  const [practiceAttempts, setPracticeAttempts] = useState({});

  // Get category info
  const foundSet = vocabularySets.find(s => s.id === setId);
  const categoryName = isPracticeList ? 'My Difficult Words' : (foundSet?.name || '11+ Practice Modules');
  const categoryEmoji = isPracticeList ? '📌' : (foundSet?.emoji || '🎯');

  useFocusEffect(
    React.useCallback(() => {
      loadPracticeAttempts();
    }, [])
  );

  const loadPracticeAttempts = async () => {
    const attempts = await storage.getPracticeAttempts();
    setPracticeAttempts(attempts);
  };

  const getLastResult = (practiceId) => {
    const key = `${practiceId}-${setId}`;
    const attempts = practiceAttempts[key];
    if (attempts && attempts.length > 0) {
      const lastAttempt = attempts[0];
      return `${lastAttempt.score}/${lastAttempt.totalQuestions}`;
    }
    return null;
  };

  const practiceTypes = [
    {
      id: 'definition',
      emoji: '⏰',
      title: 'Definition Master',
      description: '11+ style multiple choice questions to practice Definition!',
      color: 'green',
      screen: 'DefinitionPractice'
    },
    {
      id: 'synonyms',
      emoji: '🎯',
      title: 'Synonyms Master',
      description: 'Choose words with similar meanings - no time pressure!',
      color: 'purple',
      screen: 'SynonymPractice'
    },
    {
      id: 'antonyms',
      emoji: '🔄',
      title: 'Antonyms Master',
      description: 'Choose words with opposite meanings - master contrasts!',
      color: 'pink',
      screen: 'AntonymPractice'
    },
    {
      id: 'spelling',
      emoji: '✍️',
      title: 'Spell It Right',
      description: 'Listen and spell words correctly - 11+ English essential',
      color: 'blue',
      screen: 'SpellingPractice'
    },
    {
      id: 'fillGap',
      emoji: '🔤',
      title: 'Fill the Gap',
      description: 'Complete words by filling missing letters - 11+ Verbal Reasoning',
      color: 'orange',
      screen: 'FillGapPractice'
    },
    {
      id: 'missingWord',
      emoji: '📝',
      title: 'Missing Word',
      description: 'Choose the right word for sentences - 11+ exam practice',
      color: 'purple',
      screen: 'MissingWordPractice'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.learning} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >

          {/* Back Button */}
          <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
            
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isMixed ? '🎲 11+ Mixed Practice' : `${categoryEmoji} ${categoryName}`}
              </Text>
              <Text style={styles.subtitle}>Select a Practice Type below</Text>
            </View>

            {/* Practice Type Cards */}
            <View style={styles.cardsContainer}>
              {practiceTypes.map((practice) => {
                const lastResult = getLastResult(practice.id);
                return (
                  <Card
                    key={practice.id}
                    variant={practice.color}
                    onPress={() => navigation.navigate(practice.screen, { setId })}
                    style={styles.practiceCard}
                  >
                    {lastResult && (
                      <View style={styles.lastResultBadge}>
                        <Text style={styles.lastResultText}>{lastResult}</Text>
                      </View>
                    )}
                    <Text style={styles.practiceEmoji}>{practice.emoji}</Text>
                    <Text style={styles.practiceTitle}>{practice.title}</Text>
                    <Text style={styles.practiceDescription}>
                      {practice.description}
                    </Text>
                    <Button
                      variant={practice.color}
                      style={styles.practiceButton}
                      onPress={() => navigation.navigate(practice.screen, { setId })}
                    >
                      Start Practice →
                    </Button>
                  </Card>
                );
              })}
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
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 30,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.white,
    textAlign: 'center',
  },
  cardsContainer: {
    // Cards will have margin bottom instead of gap
  },
  practiceCard: {
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
    position: 'relative',
  },
  lastResultBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    zIndex: 1,
  },
  lastResultText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  practiceEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  practiceTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  practiceDescription: {
    fontSize: fontSize.base,
    color: colors.gray600,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  practiceButton: {
    alignSelf: 'stretch',
    marginHorizontal: spacing.md,
  },
});