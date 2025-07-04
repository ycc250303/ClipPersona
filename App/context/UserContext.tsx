import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ImageSourcePropType } from 'react-native';

interface UserContextType {
  nickname: string;
  avatarUri: ImageSourcePropType;
  setNickname: (name: string) => void;
  setAvatarUri: (uri: ImageSourcePropType) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

const NICKNAME_KEY = 'user_nickname';
const AVATAR_KEY = 'user_avatar_uri';

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [nickname, setNicknameState] = useState<string>('请输入昵称');
  const [avatarUri, setAvatarUriState] = useState<ImageSourcePropType>(require('../../Images/HomePage/user.png'));

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedNickname = await AsyncStorage.getItem(NICKNAME_KEY);
        if (storedNickname) {
          setNicknameState(storedNickname);
        }

        const storedAvatarUri = await AsyncStorage.getItem(AVATAR_KEY);
        if (storedAvatarUri) {
          setAvatarUriState({ uri: storedAvatarUri });
        } else {
          setAvatarUriState(require('../../Images/HomePage/user.png')); // Default avatar
        }
      } catch (error) {
        console.error('Failed to load user data from AsyncStorage', error);
      }
    };

    loadUserData();
  }, []);

  const setAndStoreNickname = async (name: string) => {
    setNicknameState(name);
    try {
      await AsyncStorage.setItem(NICKNAME_KEY, name);
    } catch (error) {
      console.error('Failed to save nickname to AsyncStorage', error);
    }
  };

  const setAndStoreAvatarUri = async (uri: ImageSourcePropType) => {
    setAvatarUriState(uri);
    try {
      if (typeof uri === 'object' && 'uri' in uri && uri.uri) {
        await AsyncStorage.setItem(AVATAR_KEY, uri.uri);
      } else {
        await AsyncStorage.removeItem(AVATAR_KEY); // Remove if setting to default/local image
      }
    } catch (error) {
      console.error('Failed to save avatar URI to AsyncStorage', error);
    }
  };

  return (
    <UserContext.Provider value={{ nickname, avatarUri, setNickname: setAndStoreNickname, setAvatarUri: setAndStoreAvatarUri }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 