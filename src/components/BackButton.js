import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';

export default function BackButton({ onPress, text = 'Back', style }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>く</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,

  },
  icon: {
    fontSize: 20,
    color: colors.white,
    fontWeight: fontWeight.bold,
    marginRight: 0,
  },
  text: {
    fontSize: fontSize.base,
    color: colors.white,
    fontWeight: fontWeight.bold,
  },
});
