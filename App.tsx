import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import MediaPickerScreen from './App/MediaPickerScreen';
import EditMediaScreen from './App/EditMediaScreen';
import TempProjectScreen from './App/TempProjectScreen';
import PersonaScreen from './App/PersonaScreen';
import CommunityScreen from './App/CommunityScreen';
import SettingsScreen from './App/SettingsScreen';
import HomeScreen from './App/HomeScreen';
import { Text, View, ImageBackground, StyleSheet, Dimensions } from 'react-native';

type RootStackParamList = {
  HomeTab: undefined;
  EditMedia: { mediaUri: string; isVideo: boolean; };
  MediaPicker: undefined;
  Projects: undefined;
  Persona: undefined;
  Community: undefined;
  Settings: undefined;
};

type EditMediaScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, 'EditMedia'>;
  route: RouteProp<RootStackParamList, 'EditMedia'>;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<RootStackParamList>();

// 临时占位组件
const PlaceholderScreen = ({ name }: { name: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 24 }}>{name}页面</Text>
    <Text>功能开发中...</Text>
  </View>
);

// 主页堆栈导航器
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="MediaPicker"
      component={MediaPickerScreen}
      options={{ headerShown: false,
          headerTransparent: true,}}
    />
    <Stack.Screen
      name="EditMedia"
      component={EditMediaScreen}
      options={{ title: '项目编辑',headerTransparent: true }}
    />
  </Stack.Navigator>
);

// 主应用组件
const App: React.FC = () => {
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
              name="Persona"
              component={PersonaScreen}
              options={{
                title: 'Persona',
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 24 }}>👤</Text>
                ),
              }}
            />
            <Tab.Screen
              name="Community"
              component={CommunityScreen}
              options={{
                title: '社区',
                tabBarIcon: ({ color }) => (
                  <Text style={{ color, fontSize: 24 }}>👥</Text>
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