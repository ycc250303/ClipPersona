import React, { useEffect } from 'react';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator, MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Platform, Text, View, ImageBackground, StyleSheet, Dimensions, PermissionsAndroid, Alert, Linking, TouchableOpacity, Image } from 'react-native';
import MediaPickerScreen from './App/MediaPickerScreen';
import EditMediaScreen from './App/EditMediaScreen';
import SettingsScreen from './App/SettingsScreen';
import HomeScreen from './App/HomeScreen';
import { requestStoragePermissions } from './App/utils/permissionManager';
import { LanguageProvider, useLanguage } from './App/context/LanguageContext';
import { UserProvider } from './App/context/UserContext';

// 定义路由参数类型
type RootStackParamList = {
  HomeTab: undefined;
  EditMedia: { mediaUri: string; isVideo: boolean; };
  MediaPicker: undefined;
  Projects: undefined;
  Settings: undefined;
};

type EditMediaScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditMedia'>;
  route: RouteProp<RootStackParamList, 'EditMedia'>;
};

const Tab = createMaterialTopTabNavigator<RootStackParamList>();
const Stack = createStackNavigator<RootStackParamList>();

// 自定义底部导航栏
const CustomTabBar: React.FC<MaterialTopTabBarProps> = ({ state, descriptors, navigation, position }) => {
  const { currentLanguage } = useLanguage();

  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
  };

  const getLabelText = (options: any, route: any) => {
    return options.title !== undefined
      ? options.title
      : route.name;
  };

  return (
    <ImageBackground
      source={require('./Images/bottom-tabs.png')}
      style={styles.tabBarBackground}
      resizeMode="cover"
    >
      <View style={styles.tabBarContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = getLabelText(options, route);
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const icon = options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color: isFocused ? '#FFFFFF' : '#B0B0B0' }) : null;

          return (
            <TouchableOpacity
              key={route.key} // Add key for list rendering
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabBarItem}
            >
              {icon}
              <Text style={{ color: isFocused ? '#007AFF' : 'gray', fontSize: 12, marginBottom: 3 }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ImageBackground>
  );
};

const HomeStack = () => {
  const { currentLanguage } = useLanguage();

  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
  };

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MediaPicker"
        component={MediaPickerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditMedia"
        component={EditMediaScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const MainTabs = () => {
  const { currentLanguage } = useLanguage();

  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
  };

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      tabBarPosition="bottom"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 65,
          paddingBottom: 10,
          paddingTop: 5,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
          elevation: 10,
          zIndex: 999,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 3,
        },
        tabBarIndicatorStyle: {
          opacity: 0,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          title: getLocalizedText('主页', 'Home'),
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                source={require('./Images/home.png')}
                style={[styles.icon, { tintColor: focused ? '#FFFFFF' : '#B0B0B0' }]}
              />
              {focused && <View style={styles.indicator} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={HomeStack}
        options={{
          title: getLocalizedText('剪辑', 'Edit'),
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                source={require('./Images/edit.png')}
                style={[styles.icon, { tintColor: focused ? '#FFFFFF' : '#B0B0B0' }]}
              />
              {focused && <View style={styles.indicator} />}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: getLocalizedText('设置', 'Settings'),
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Image
                source={require('./Images/setting.png')}
                style={[styles.icon, { tintColor: focused ? '#FFFFFF' : '#B0B0B0' }]}
              />
              {focused && <View style={styles.indicator} />}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// 权限请求函数
const requestPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);

        const allGranted = Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert(
            '权限请求',
            '需要存储权限才能正常使用应用。请在设置中开启相关权限。',
            [
              {
                text: '去设置',
                onPress: () => {
                  Linking.openSettings().catch(() => {
                    Alert.alert('提示', '无法打开设置页面');
                  });
                },
              },
              {
                text: '取消',
                style: 'cancel',
              },
            ]
          );
        }
      } else {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);

        const allGranted = Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert(
            '权限请求',
            '需要存储权限才能正常使用应用。请在设置中开启相关权限。',
            [
              {
                text: '去设置',
                onPress: () => {
                  Linking.openSettings().catch(() => {
                    Alert.alert('提示', '无法打开设置页面');
                  });
                },
              },
              {
                text: '取消',
                style: 'cancel',
              },
            ]
          );
        }
      }
    } catch (err) {
      console.warn('权限请求失败:', err);
    }
  }
};

// 主应用组件
const App: React.FC = () => {
  // 在应用启动时请求权限
  useEffect(() => {
    const checkPermissions = async () => {
      const granted = await requestStoragePermissions();
      if (!granted) {
        console.warn('存储权限未获得，部分功能可能无法正常使用');
      }
    };
    checkPermissions();
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('./Images/background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <LanguageProvider>
          <UserProvider>
            <NavigationContainer>
              <MainTabs />
            </NavigationContainer>
          </UserProvider>
        </LanguageProvider>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  tabBarBackground: {
    height: 65,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    zIndex: 999,
  },
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  indicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#007AFF',
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

export default App;