import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import { useSubscription } from '../context/SubscriptionContext';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';

const EMOJI_OPTIONS = ['👦', '👧', '🧒', '👶', '🧑', '👨', '👩', '🎓', '📚', '🌟', '🚀', '⭐'];
const COLOR_OPTIONS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function ProfileSwitcher({ style }) {
  const { currentProfile, profiles, switchProfile, createProfile, updateProfile, deleteProfile } = useProfile();
  const { isFamilyPlan } = useSubscription();
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [newName, setNewName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('👦');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');

  if (!isFamilyPlan) return null;

  const handleProfilePress = async (profileId) => {
    await switchProfile(profileId);
    setModalVisible(false);
  };

  const openCreateProfile = () => {
    if (profiles.length >= 5) {
      Alert.alert('Maximum Profiles', 'You can have up to 5 child profiles');
      return;
    }
    setEditMode(true);
    setEditingProfile(null);
    setNewName('');
    setSelectedEmoji('👦');
    setSelectedColor('#3b82f6');
  };

  const openEditProfile = (profile) => {
    setEditMode(true);
    setEditingProfile(profile);
    setNewName(profile.name);
    setSelectedEmoji(profile.emoji);
    setSelectedColor(profile.color);
  };

  const handleSaveProfile = async () => {
    if (!newName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for the profile');
      return;
    }

    if (editingProfile) {
      await updateProfile(editingProfile.id, {
        name: newName.trim(),
        emoji: selectedEmoji,
        color: selectedColor,
      });
    } else {
      await createProfile(newName.trim(), selectedEmoji, selectedColor);
    }

    setEditMode(false);
    setEditingProfile(null);
  };

  const handleDeleteProfile = async () => {
    if (!editingProfile) return;
    
    Alert.alert(
      'Delete Profile',
      `Are you sure you want to delete ${editingProfile.name}'s profile? All progress will be lost.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteProfile(editingProfile.id);
            if (success) {
              setEditMode(false);
              setEditingProfile(null);
            } else {
              Alert.alert('Cannot Delete', 'You must keep at least one profile');
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.container, style]}>
        <View style={[styles.profileBubble, { backgroundColor: currentProfile?.color || '#3b82f6' }]}>
          <Text style={styles.profileEmoji}>{currentProfile?.emoji || '👦'}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileLabel}>Current Child</Text>
          <Text style={styles.profileName}>{currentProfile?.name || 'Child 1'}</Text>
        </View>
        <Text style={styles.switchIcon}>⇄</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {!editMode ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Switch Profile</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.profilesList}>
                  {profiles.map((profile) => (
                    <View key={profile.id} style={styles.profileRow}>
                      <TouchableOpacity
                        onPress={() => handleProfilePress(profile.id)}
                        style={[
                          styles.profileItem,
                          currentProfile?.id === profile.id && styles.profileItemActive,
                        ]}
                      >
                        <View style={[styles.profileBubbleLarge, { backgroundColor: profile.color }]}>
                          <Text style={styles.profileEmojiLarge}>{profile.emoji}</Text>
                        </View>
                        <View style={styles.profileItemInfo}>
                          <Text style={styles.profileItemName}>{profile.name}</Text>
                          {currentProfile?.id === profile.id && (
                            <Text style={styles.currentBadge}>✓ Current</Text>
                          )}
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => openEditProfile(profile)}
                        style={styles.editButton}
                      >
                        <Text style={styles.editButtonText}>✎</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>

                {profiles.length < 5 && (
                  <TouchableOpacity onPress={openCreateProfile} style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Add New Child</Text>
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    {editingProfile ? 'Edit Profile' : 'Create Profile'}
                  </Text>
                  <TouchableOpacity onPress={() => setEditMode(false)}>
                    <Text style={styles.closeButton}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.editForm}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Enter child's name"
                    maxLength={20}
                  />

                  <Text style={styles.label}>Choose Avatar</Text>
                  <View style={styles.emojiGrid}>
                    {EMOJI_OPTIONS.map((emoji) => (
                      <TouchableOpacity
                        key={emoji}
                        onPress={() => setSelectedEmoji(emoji)}
                        style={[
                          styles.emojiOption,
                          selectedEmoji === emoji && styles.emojiOptionSelected,
                        ]}
                      >
                        <Text style={styles.emojiOptionText}>{emoji}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.label}>Choose Color</Text>
                  <View style={styles.colorGrid}>
                    {COLOR_OPTIONS.map((color) => (
                      <TouchableOpacity
                        key={color}
                        onPress={() => setSelectedColor(color)}
                        style={[
                          styles.colorOption,
                          { backgroundColor: color },
                          selectedColor === color && styles.colorOptionSelected,
                        ]}
                      />
                    ))}
                  </View>

                  <TouchableOpacity onPress={handleSaveProfile} style={styles.saveButton}>
                    <Text style={styles.saveButtonText}>
                      {editingProfile ? 'Save Changes' : 'Create Profile'}
                    </Text>
                  </TouchableOpacity>

                  {editingProfile && (
                    <TouchableOpacity onPress={handleDeleteProfile} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>Delete Profile</Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  profileEmoji: {
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileLabel: {
    fontSize: fontSize.xs,
    color: colors.gray600,
    fontWeight: fontWeight.medium,
  },
  profileName: {
    fontSize: fontSize.base,
    color: colors.gray800,
    fontWeight: fontWeight.bold,
  },
  switchIcon: {
    fontSize: 20,
    color: colors.gray600,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  closeButton: {
    fontSize: 24,
    color: colors.gray600,
    fontWeight: fontWeight.bold,
  },
  profilesList: {
    marginBottom: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  profileItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileItemActive: {
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
  },
  profileBubbleLarge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileEmojiLarge: {
    fontSize: 24,
  },
  profileItemInfo: {
    flex: 1,
  },
  profileItemName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
  },
  currentBadge: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    marginTop: 2,
  },
  editButton: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  editButtonText: {
    fontSize: 20,
    color: colors.gray600,
  },
  addButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  editForm: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.gray800,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.gray50,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: fontSize.base,
    borderWidth: 2,
    borderColor: colors.gray200,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emojiOption: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: '#eff6ff',
  },
  emojiOptionText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: colors.gray800,
  },
  saveButton: {
    backgroundColor: colors.success,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  saveButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  deleteButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  deleteButtonText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
});
