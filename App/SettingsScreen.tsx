import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';

const TempPersonaScreen = () => (
  <ImageBackground
    source={require('../Images/background.png')}
    style={styles.background}
    resizeMode="cover"
  >
    <View style={styles.overlay}>
      <Text style={styles.title}>设置页面</Text>
      <Text style={styles.subtitle}>功能开发中...</Text>
    </View>
  </ImageBackground>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
  },
});

export default TempPersonaScreen;
