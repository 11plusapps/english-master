import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme';

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  gradient,
  style,
  textStyle,
  ...props
}) {
  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress?.();
    }
  };

  const getGradientColors = () => {
    if (gradient) return gradient;
    
    switch (variant) {
      case 'primary':
        return [colors.primary, colors.primaryDark];
      case 'secondary':
        return [colors.secondary, colors.secondaryDark];
      case 'success':
      case 'green':
        return [colors.success, colors.successDark];
      case 'error':
        return [colors.error, colors.errorDark];
      case 'warning':
        return [colors.warning, colors.warningDark];
      case 'purple':
        return [colors.purple, colors.purpleDark];
      case 'orange':
        return [colors.orange, colors.orangeDark];
      case 'pink':
        return ['#662D8C', '#ED1E79'];
      case 'darkGreen':
        return ['#1c6508ff', '#3fa417ff'];       
      case 'blue':
        return ['#3b82f6', '#1e40af'];
      case 'redPink':
        return ['#32074fff', '#ed1e1eff'];
      case 'red':
        return ['#110106ff', '#0d0005ff'];
      default:
        return [colors.primary, colors.primaryDark];
    }

  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16, fontSize: fontSize.sm };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32, fontSize: fontSize.xl };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24, fontSize: fontSize.base };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[styles.container, disabled && styles.disabled, style]}
      {...props}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { paddingVertical: sizeStyles.paddingVertical, paddingHorizontal: sizeStyles.paddingHorizontal }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            {typeof children === 'string' ? (
              <Text style={[styles.text, { fontSize: sizeStyles.fontSize }, textStyle]}>
                {children}
              </Text>
            ) : (
              children
            )}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  icon: {
    fontSize: fontSize.xl,
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});
