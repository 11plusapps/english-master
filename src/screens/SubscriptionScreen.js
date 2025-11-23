import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/Card';
import { colors, gradients, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';

export default function SubscriptionScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState('1year');

  const plans = [
    {
      id: '1month',
      duration: '1 Month',
      price: '£1.99',
      pricePerMonth: '£1.99/month',
      savings: null,
      popular: false,
    },
    {
      id: '6months',
      duration: '6 Months',
      price: '£8.99',
      pricePerMonth: '£1.50/month',
      savings: 'Save 25%',
      popular: false,
    },
    {
      id: '1year',
      duration: '1 Year',
      price: '£9.99',
      originalPrice: '£23.88',
      pricePerMonth: '£0.83/month',
      savings: 'Save 58%',
      limitedOffer: true,
      popular: true,
    },
  ];

  const features = [
    { icon: '📚', text: '2500+ Words', subtext: 'Complete 11+ Exam Vocabulary' },
    { icon: '🎯', text: 'All Categories', subtext: 'Unlimited Access' },
    { icon: '🎮', text: 'Practice Modules', subtext: 'All 6 Types' },
    { icon: '🔄', text: 'Unlimited Practices', subtext: 'Random questions from 2000+ words' },
    { icon: '🕹️', text: 'Fun Games', subtext: 'Unlimited Plays' },
    { icon: '📝', text: 'Mock Tests', subtext: 'Unlimited Access' },
    { icon: '📊', text: 'Progress Tracking', subtext: 'Detailed Stats' },
    { icon: '⚡', text: 'Ad-Free', subtext: 'No Interruptions' },
  ];

  const handleSubscribe = () => {
    console.log('Selected plan:', selectedPlan);
    alert('Subscription feature will be connected to App Store/Play Store in production!');
  };

  const handleRestore = () => {
    alert('Restore purchases feature will be implemented with App Store/Play Store!');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={gradients.home} style={styles.gradient}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Scrollable Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.emoji}>👑</Text>
              <Text style={styles.title}>Unlock Premium</Text>
              <Text style={styles.subtitle}>
                Join thousands of successful 11+ students!
              </Text>
            </View>

            {/* Plans */}
            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id)}
                  style={[
                    styles.planCard,
                    selectedPlan === plan.id && styles.planCardSelected,
                  ]}
                >
                  {plan.popular && (
                    <LinearGradient
                      colors={['#fbbf24', '#f59e0b']}
                      style={styles.popularBadge}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.popularText}>⭐ BEST VALUE ⭐</Text>
                    </LinearGradient>
                  )}
                  
                  <View style={styles.planContent}>
                    <View style={styles.planLeft}>
                      <Text style={styles.planDuration}>{plan.duration}</Text>
                      <Text style={styles.planPricePerMonth}>{plan.pricePerMonth}</Text>
                      {plan.savings && (
                        <View style={styles.savingsBadge}>
                          <Text style={styles.savingsText}>{plan.savings}</Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.planRight}>
                      {plan.limitedOffer && (
                        <Text style={styles.limitedOfferText}>Limited Time!</Text>
                      )}
                      {plan.originalPrice && (
                        <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                      )}
                      <Text style={styles.planPrice}>{plan.price}</Text>
                    </View>

                    {selectedPlan === plan.id && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Features List */}
            <Card style={styles.featuresCard}>
              <Text style={styles.featuresTitle}>✨ What You'll Get ✨</Text>
              <View style={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIconContainer}>
                      <Text style={styles.featureIcon}>{feature.icon}</Text>
                    </View>
                    <View style={styles.featureTextContainer}>
                      <Text style={styles.featureMainText}>{feature.text}</Text>
                      <Text style={styles.featureSubtext}>{feature.subtext}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Card>

            {/* Restore Purchases */}
            <TouchableOpacity onPress={handleRestore} style={styles.restoreButton}>
              <Text style={styles.restoreText}>Restore Purchases</Text>
            </TouchableOpacity>

            {/* Cancel Anytime */}
            <View style={styles.cancelAnytimeContainer}>
              <Text style={styles.cancelAnytimeText}>✓ You can cancel anytime</Text>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              Subscription auto-renews unless cancelled 24 hours before period ends. Payment charged to Apple ID/Google Play. Manage subscriptions in account settings.
            </Text>

            {/* Extra padding for sticky button */}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Sticky Subscribe Button */}
          <View style={styles.stickyButtonContainer}>
            <LinearGradient
              colors={['#10b981', '#059669']}
              style={styles.subscribeButtonGradient}
            >
              <TouchableOpacity onPress={handleSubscribe} style={styles.subscribeButtonTouch}>
                <Text style={styles.subscribeButtonText}>Subscribe Now 🚀</Text>
              </TouchableOpacity>
            </LinearGradient>
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
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.md + 80, // Extra padding for sticky button
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.md,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  backButtonIcon: {
    fontSize: 20,
    color: colors.white,
    fontWeight: fontWeight.bold,
    marginRight: spacing.xs,
  },
  backButtonText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xs / 2,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.95,
  },
  plansContainer: {
    marginBottom: spacing.md,
  },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray300,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planCardSelected: {
    borderColor: colors.success,
    borderWidth: 3,
    backgroundColor: '#f0fdf4',
    shadowColor: colors.success,
    shadowOpacity: 0.3,
    elevation: 6,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -80 }],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  popularText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  planContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: spacing.xl + spacing.md, // Increased padding to prevent overlap with checkmark
  },
  planLeft: {
    flex: 1,
  },
  planDuration: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 4,
  },
  planPricePerMonth: {
    fontSize: fontSize.sm,
    color: colors.gray600,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs / 2,
  },
  planRight: {
    alignItems: 'flex-end',
  },
  limitedOfferText: {
    fontSize: fontSize.sm,
    color: colors.error,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs / 4,
  },
  originalPrice: {
    fontSize: fontSize.base,
    color: colors.gray500,
    textDecorationLine: 'line-through',
    marginBottom: spacing.xs / 4,
  },
  planPrice: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  savingsBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs / 2,
  },
  savingsText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.success,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  checkmarkText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: fontWeight.bold,
  },
  featuresCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  featuresTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  featureIcon: {
    fontSize: 18,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureMainText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.xs / 4,
  },
  featureSubtext: {
    fontSize: fontSize.xs,
    color: colors.gray600,
  },
  noteCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  noteTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  noteText: {
    fontSize: fontSize.sm,
    color: colors.gray700,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  restoreButton: {
    padding: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  restoreText: {
    fontSize: fontSize.sm,
    color: colors.white,
    fontWeight: fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  cancelAnytimeContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  cancelAnytimeText: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
  termsText: {
    fontSize: fontSize.xs,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 16,
    marginBottom: spacing.md,
  },
  bottomPadding: {
    height: 20,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: 'transparent',
  },
  subscribeButtonGradient: {
    borderRadius: borderRadius.lg,
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  subscribeButtonTouch: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
        width: '100%',
  },
  subscribeButtonText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});