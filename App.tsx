import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { Platform, Text, View, ImageBackground, StyleSheet, Dimensions, PermissionsAndroid, Alert, Linking } from 'react-native';
import MediaPickerScreen from './App/MediaPickerScreen';
import EditMediaScreen from './App/EditMediaScreen';
import SettingsScreen from './App/SettingsScreen';
import HomeScreen from './App/HomeScreen';
import { requestStoragePermissions } from './App/utils/permissionManager';

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

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

// 主页堆栈导航器
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MediaPicker"
      component={MediaPickerScreen}
      options={{
        headerShown: false,
        headerTransparent: true,
      }}
    />
    <Stack.Screen
      name="EditMedia"
      component={EditMediaScreen}
      options={{ title: '项目编辑', headerTransparent: true, headerTintColor: 'white' }}
    />
  </Stack.Navigator>
);

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
        <NavigationContainer>
          <Tab.Navigator
            initialRouteName="Projects"
            screenOptions={{
              tabBarActiveTintColor: '#007AFF',
              tabBarInactiveTintColor: 'gray',
              tabBarBackground: () => (
                <ImageBackground
                  source={require('./Images/bottom-tabs.png')}
                  style={{ flex: 1 }}
                  resizeMode="cover"
                />
              ),
              tabBarStyle: {
                height: 60,
                paddingBottom: 10,
                paddingTop: 5,
                backgroundColor: 'transparent',
                zIndex: 999,
              },
              tabBarLabelStyle: {
                fontSize: 12,
              },
              headerShown: false,
            }}
          >
            <Tab.Screen
              name="HomeTab"
              component={HomeScreen}
              options={{
                title: '主页',
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 24 }}>🏠</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Projects"
              component={HomeStack}
              options={{
                title: '项目',
                headerShown: false,
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 24 }}>📁</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                title: '设置',
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 24 }}>⚙️</Text>
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
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
});

export default App;