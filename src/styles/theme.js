export const colors = {
  // Primary colors
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#93c5fd',

  // Secondary colors
  secondary: '#a855f7',
  secondaryDark: '#9333ea',
  secondaryLight: '#d8b4fe',

  // Status colors
  success: '#10b981',
  successDark: '#059669',
  successLight: '#86efac',

  error: '#ef4444',
  errorDark: '#dc2626',
  errorLight: '#fca5a5',

  warning: '#f59e0b',
  warningDark: '#d97706',
  warningLight: '#fbbf24',

  info: '#06b6d4',
  infoDark: '#0891b2',
  infoLight: '#67e8f9',

  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  // Nested gray object for bracket notation
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Set colors
  orange: '#f97316',
  orangeLight: '#fdba74',
  orangeDark: '#ea580c',

  purple: '#a855f7',
  purpleLight: '#d8b4fe',
  purpleDark: '#9333ea',

  cyan: '#06b6d4',
  cyanLight: '#67e8f9',
  cyanDark: '#0891b2',

  pink: '#ec4899',
  pinkLight: '#f9a8d4',
  pinkDark: '#db2777',

  yellow: '#eab308',
  yellowLight: '#fde047',
  yellowDark: '#ca8a04',

  green: '#10b981',
  greenLight: '#86efac',
  greenDark: '#059669',

  // Nested color objects for bracket notation
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    500: '#3b82f6',
    600: '#2563eb',
  },
  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    500: '#f97316',
    600: '#ea580c',
  },
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#10b981',
    600: '#059669',
  },
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#a855f7',
    600: '#9333ea',
  },
  pink: {
    50: '#fdf2f8',
    100: '#fce7f3',
    500: '#ec4899',
    600: '#db2777',
  },
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    500: '#6366f1',
    600: '#4f46e5',
  },
  cyan: {
    50: '#ecfeff',
    100: '#cffafe',
    500: '#06b6d4',
    600: '#0891b2',
  },
};

export const gradients = {
  home: ['#9333ea', '#ec4899', '#f97316'],
  learning: ['#3b82f6', '#a855f7', '#ec4899'],
  games: ['#10b981', '#14b8a6', '#3b82f6'],
  tests: ['#a855f7', '#ec4899', '#ef4444'],
  flashcard: ['#4f46e5', '#7c3aed', '#ec4899'],
  quiz: ['#4f46e5', '#7c3aed', '#ec4899'],
  results: ['#3b82f6', '#14b8a6', '#10b981'],
  orange: ['#f97316', '#ea580c'],
  blue: ['#3b82f6', '#2563eb'],
  cyan: ['#06b6d4', '#0891b2'],
  purple: ['#a855f7', '#9333ea'],
  fun: ['#eab308', '#f97316', '#ef4444'],
  funGames: ['#eab308', '#f97316', '#ef4444'],
  mockTest: ['#a855f7', '#ec4899', '#ef4444'],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const fontWeight = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};

// Common Component Styles
export const commonStyles = {
  // Premium Badge (for locked categories)
  premiumBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: '#fef3c7',
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  premiumText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
  },
  
  // Lock Icon Container (positioned absolutely)
  lockIconContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
  },
  lockIcon: {
    fontSize: 24,
    opacity: 0.9,
  },
  
  // Lock Container (for inline lock icons)
  lockContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockInlineIcon: {
    fontSize: 20,
  },
  
  // Arrow Container
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryArrow: {
    fontSize: 24,
    color: '#374151',
    fontWeight: '700',
  },
  
  // Action Indicator
  actionIndicator: {
    marginLeft: 8,
  },
  
  // Emoji Container
  emojiContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 32,
  },
};
