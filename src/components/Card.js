import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../styles/theme';

export default function Card({ children, onPress, style, variant = 'default', ...props }) {
  const Container = onPress ? TouchableOpacity : View;

  const getVariantStyle = () => {
    switch (variant) {
      case 'blue':
        return { backgroundColor: colors.gray50, borderColor: colors.primaryLight, borderWidth: 4 };
      case 'green':
        return { backgroundColor: colors.gray50, borderColor: colors.successLight, borderWidth: 4 };
      case 'purple':
        return { backgroundColor: colors.gray50, borderColor: colors.purpleLight, borderWidth: 4 };
      case 'orange':
        return { backgroundColor: colors.gray50, borderColor: colors.orangeLight, borderWidth: 4 };
      default:
        return {};
    }
  };

  return (
    <Container
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      style={[styles.card, getVariantStyle(), style]}
      {...props}
    >
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
});
