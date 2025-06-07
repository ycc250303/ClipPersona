import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ImageBackground } from 'react-native';
import MediaPickerScreen from './MediaPickerScreen';
import EditMediaScreen from './EditMediaScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// 占位屏幕组件
const PlaceholderScreen = ({ name }: { name: string }) => (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 24 }}>{name}</Text>
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
            options={{ title: '项目编辑' }}
        />
    </Stack.Navigator>
);

// 主应用组件
const App: React.FC = () => {
    return (
        <View style={{ flex: 1 }}>
            <ImageBackground
                source={require('./Images/background.png')}
                style={{ flex: 1 }}
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
                            },
                            tabBarLabelStyle: {
                                fontSize: 12,
                            },
                            headerShown: false,
                            contentStyle: {
                                backgroundColor: 'transparent',
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
        </View>
    );
};

export default App; 