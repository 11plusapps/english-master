import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import { colors, gradients, spacing, fontSize, fontWeight } from '../../styles/theme';

export default function ResultsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.results} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.content}>
            <Text style={styles.emoji}>🏆</Text>
            <Text style={styles.title}>Results</Text>
            <Button variant="primary" onPress={() => navigation.navigate('Main')}>
              Back to Home
            </Button>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  emoji: { fontSize: 80, marginBottom: spacing.lg },
  title: { fontSize: fontSize.xxxl, fontWeight: fontWeight.bold, color: colors.white, marginBottom: spacing.lg },
});
