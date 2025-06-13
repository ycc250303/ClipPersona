import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Alert,
  Dimensions,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Video from 'react-native-video';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// API配置
const API_CONFIG = {
  BASE_URL: 'http://139.224.33.240:8000',
  ENDPOINTS: {
    UPLOAD_VIDEO: '/upload-video',
  }
};

// 导航参数类型定义
type RootStackParamList = {
  EditMedia: {
    mediaUri: string;
    isVideo: boolean;
  };
};

const MediaPickerScreen: React.FC = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isVideo, setIsVideo] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = screenWidth * 0.8;

  const backgroundStyle = {
    backgroundColor: 'transparent',
    flex: 1,
  };

  const pickVideo = async () => {
    launchImageLibrary(
      {
        mediaType: 'video',
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          Alert.alert('错误', `选择视频失败: ${response.errorMessage}`);
        } else if (response.assets && response.assets[0].uri) {
          setMediaUri(response.assets[0].uri);
          setIsVideo(true);
        }
      },
    );
  };

  const captureVideo = async () => {
    launchCamera(
      {
        mediaType: 'video',
        includeBase64: false,
      },
      (response) => {
        if (response.didCancel) {
          return;
        } else if (response.errorCode) {
          Alert.alert('错误', `录制视频失败: ${response.errorMessage}`);
        } else if (response.assets && response.assets[0].uri) {
          setMediaUri(response.assets[0].uri);
          setIsVideo(true);
        }
      },
    );
  };

  const handleEditPress = () => {
    if (!mediaUri) {
      Alert.alert('提示', '请先选择视频');
      return;
    }

    navigation.navigate('EditMedia', {
      mediaUri,
      isVideo,
    });
  };

  const handleClearMedia = () => {
    setMediaUri(null);
    setIsVideo(false);
  };

  return (
    <ImageBackground
      source={require('../Images/background.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <ScrollView style={backgroundStyle}>
        <View style={[styles.container, { paddingHorizontal: '5%', paddingBottom: '5%' }]}>
          <Text style={[styles.title, { color: isDarkMode ? Colors.black : Colors.white }]}>
            选择并展示视频素材
          </Text>
          <View style={styles.buttonContainer}>
            <View style={styles.buttonWrapper}>
              <TouchableOpacity
                style={[styles.customButton, { width: buttonWidth }]}
                onPress={pickVideo}
              >
                <Text style={styles.buttonText}>选择视频</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.customButton, { width: buttonWidth }]}
                onPress={captureVideo}
              >
                <Text style={styles.buttonText}>录制视频</Text>
              </TouchableOpacity>
            </View>
          </View>

          {mediaUri && (
            <>
              <View style={styles.mediaContainer}>
                {isVideo ? (
                  <Video
                    source={{ uri: mediaUri }}
                    style={styles.media}
                    controls={true}
                    resizeMode="contain"
                    onError={(error: any) => {
                      Alert.alert('错误', `视频播放失败: ${error.message}`);
                    }}
                  />
                ) : (
                  <Image
                    source={{ uri: mediaUri }}
                    style={styles.media}
                    resizeMode="contain"
                  />
                )}
              </View>
              <View style={styles.actionButtonContainer}>
                <TouchableOpacity
                  style={[styles.customButton, { backgroundColor: isDarkMode ? '#1E90FF' : '#007AFF' }]}
                  onPress={handleEditPress}
                >
                  <Text style={styles.buttonText}>进入编辑</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.customButton, { backgroundColor: isDarkMode ? '#FF4444' : '#FF3B30' }]}
                  onPress={handleClearMedia}
                >
                  <Text style={styles.buttonText}>重新选择</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: 75,
    fontSize: 24,
    fontWeight: '600',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonWrapper: {
    alignItems: 'center',
    gap: 20,
  },
  customButton: {
    height: 50,
    backgroundColor: 'rgb(120, 121, 241)',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  mediaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  media: {
    width: Dimensions.get('window').width * 0.9,
    height: Dimensions.get('window').width * 0.6,
    borderRadius: 10,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default MediaPickerScreen;
