import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/Button';
import Card from '../../components/Card';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../../styles/theme';

export default function MockTestInfoScreen({ mockTestMinutes, onBack, onStartTest }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.mockTest} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.infoScreenContainer}>
            <Text style={styles.infoScreenEmoji}>🎯</Text>
            <Text style={styles.infoScreenTitle}>Get Ready!</Text>
            
            <Card style={styles.infoScreenCard}>
              <Text style={styles.infoScreenSection}>📝 30 Questions</Text>
              <Text style={styles.infoScreenSection}>
                ⏰ {mockTestMinutes} Minute{mockTestMinutes !== 1 ? 's' : ''} Time Limit
              </Text>
              <Text style={styles.infoScreenSection}>🎯 Mix of All Question Types</Text>
              <Text style={styles.infoScreenSection}>🌟 Answer All Questions</Text>
            </Card>

            <View style={styles.settingsNote}>
              <Text style={styles.settingsNoteText}>
                💡 You can change the time limit in ⚙️ Settings
              </Text>
            </View>

            <View style={styles.infoScreenButtons}>
              <Button
                variant="secondary"
                onPress={onBack}
                style={styles.infoButton}
              >
                ← Back to Mock Tests
              </Button>
              <Button
                variant="green"
                onPress={onStartTest}
                style={styles.infoButton}
              >
                Start Test Now 🚀
              </Button>

            </View>
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
  infoScreenContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: spacing.xl 
  },
  infoScreenEmoji: { fontSize: 80, marginBottom: spacing.md },
  infoScreenTitle: { 
    fontSize: fontSize.xxxl, 
    fontWeight: fontWeight.bold, 
    color: colors.white, 
    marginBottom: spacing.xl 
  },
  infoScreenCard: { 
    width: '100%', 
    padding: spacing.xl, 
    marginBottom: spacing.lg 
  },
  infoScreenSection: { 
    fontSize: fontSize.lg, 
    color: colors.gray700, 
    marginBottom: spacing.md, 
    textAlign: 'center', 
    fontWeight: fontWeight.semibold 
  },
  settingsNote: { 
    backgroundColor: 'rgba(255,255,255,0.2)', 
    padding: spacing.md, 
    borderRadius: borderRadius.lg, 
    marginBottom: spacing.xl 
  },
  settingsNoteText: { 
    fontSize: fontSize.md, 
    color: colors.white, 
    textAlign: 'center' 
  },
  infoScreenButtons: { 
    flexDirection: 'row', 
    width: '100%' 
  },
  infoButton: { 
    flex: 1, 
    marginHorizontal: spacing.xs 
  },
});
