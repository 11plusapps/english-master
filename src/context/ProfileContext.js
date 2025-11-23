import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const storedProfiles = await AsyncStorage.getItem('profiles');
      const storedCurrentId = await AsyncStorage.getItem('current_profile_id');
      
      if (storedProfiles) {
        const parsedProfiles = JSON.parse(storedProfiles);
        setProfiles(parsedProfiles);
        
        if (storedCurrentId) {
          const profile = parsedProfiles.find(p => p.id === storedCurrentId);
          setCurrentProfile(profile || parsedProfiles[0]);
        } else if (parsedProfiles.length > 0) {
          setCurrentProfile(parsedProfiles[0]);
        }
      } else {
        const defaultProfile = {
          id: 'default',
          name: 'Child 1',
          emoji: '👦',
          color: '#3b82f6',
          createdAt: new Date().toISOString(),
        };
        setProfiles([defaultProfile]);
        setCurrentProfile(defaultProfile);
        await AsyncStorage.setItem('profiles', JSON.stringify([defaultProfile]));
        await AsyncStorage.setItem('current_profile_id', defaultProfile.id);
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (name, emoji, color) => {
    try {
      const newProfile = {
        id: `profile_${Date.now()}`,
        name,
        emoji,
        color,
        createdAt: new Date().toISOString(),
      };
      
      const updatedProfiles = [...profiles, newProfile];
      setProfiles(updatedProfiles);
      await AsyncStorage.setItem('profiles', JSON.stringify(updatedProfiles));
      return newProfile;
    } catch (error) {
      console.error('Error creating profile:', error);
      return null;
    }
  };

  const updateProfile = async (profileId, updates) => {
    try {
      const updatedProfiles = profiles.map(p => 
        p.id === profileId ? { ...p, ...updates } : p
      );
      setProfiles(updatedProfiles);
      await AsyncStorage.setItem('profiles', JSON.stringify(updatedProfiles));
      
      if (currentProfile?.id === profileId) {
        setCurrentProfile({ ...currentProfile, ...updates });
      }
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  };

  const deleteProfile = async (profileId) => {
    try {
      if (profiles.length === 1) return false;
      
      const updatedProfiles = profiles.filter(p => p.id !== profileId);
      setProfiles(updatedProfiles);
      await AsyncStorage.setItem('profiles', JSON.stringify(updatedProfiles));
      
      if (currentProfile?.id === profileId) {
        await switchProfile(updatedProfiles[0].id);
      }
      return true;
    } catch (error) {
      console.error('Error deleting profile:', error);
      return false;
    }
  };

  const switchProfile = async (profileId) => {
    try {
      const profile = profiles.find(p => p.id === profileId);
      if (profile) {
        setCurrentProfile(profile);
        await AsyncStorage.setItem('current_profile_id', profileId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error switching profile:', error);
      return false;
    }
  };

  const value = {
    currentProfile,
    profiles,
    loading,
    createProfile,
    updateProfile,
    deleteProfile,
    switchProfile,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
};
