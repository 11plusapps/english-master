import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight } from '../../styles/theme';

export default function QuizScreen({ route, navigation }) {
  const { setId } = route.params;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.quiz} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.content}>
            <Button
              variant="primary"
              size="small"
              onPress={() => navigation.goBack()}
              icon="◀"
              style={styles.backButton}
            >
              Back
            </Button>
            
            <Text style={styles.emoji}>🎯</Text>
            <Text style={styles.title}>Quiz Mode</Text>
            <Text style={styles.subtitle}>Coming Soon!</Text>
            <Text style={styles.description}>
              Test your knowledge with timed questions and track your progress.
            </Text>
          </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
    color: colors.white,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: fontSize.lg,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
});
