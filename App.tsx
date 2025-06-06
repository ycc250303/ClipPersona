import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MediaPickerScreen from './App/MediaPickerScreen';
import EditMediaScreen from './App/EditMediaScreen';
import TempProjectScreen from './App/TempProjectScreen';
import PersonaScreen from './App/PersonaScreen'; 
import CommunityScreen from './App/CommunityScreen';
import SettingsScreen from './App/SettingsScreen'; 
import { Text, View, ImageBackground, StyleSheet, Dimensions } from 'react-native'; 

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator(); // 创建底部导航器

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
      options={{ title: '选择媒体', headerShown: false }}
    />
    <Stack.Screen
      name="EditMedia"
      component={EditMediaScreen}
      options={{ title: '编辑媒体' }}
    />
  </Stack.Navigator>
);

// 主应用组件
const App: React.FC = () => {
  return (
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
            tabBarStyle: {
              height: 60,
              paddingBottom: 10,
              paddingTop: 5,
            },
            tabBarLabelStyle: {
              fontSize: 12,
            },
          }}
        >
          <Tab.Screen
            name="HomeTab"
            component={() => <PlaceholderScreen name="主页" />}
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
            component={() => <PlaceholderScreen name="Persona" />}
            options={{
              title: 'Persona',
              tabBarIcon: ({ color }) => (
                <Text style={{ color, fontSize: 24 }}>👤</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Community"
            component={() => <PlaceholderScreen name="社区" />}
            options={{
              title: '社区',
              tabBarIcon: ({ color }) => (
                <Text style={{ color, fontSize: 24 }}>👥</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={() => <PlaceholderScreen name="设置" />}
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
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default App;