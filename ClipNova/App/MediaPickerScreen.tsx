import React, { useState } from 'react';
import {
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
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { useLanguage } from './context/LanguageContext';

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
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number } | null>(null);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const screenWidth = Dimensions.get('window').width;
  const { currentLanguage } = useLanguage();

  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
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
          Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText(`选择视频失败: ${response.errorMessage}`, `Failed to select video: ${response.errorMessage}`));
        } else if (response.assets && response.assets[0].uri) {
          setMediaUri(response.assets[0].uri);
          setIsVideo(true);
          if (response.assets[0].width && response.assets[0].height) {
            setMediaDimensions({
              width: response.assets[0].width,
              height: response.assets[0].height,
            });
          } else {
            setMediaDimensions(null);
          }
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
          Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText(`录制视频失败: ${response.errorMessage}`, `Failed to record video: ${response.errorMessage}`));
        } else if (response.assets && response.assets[0].uri) {
          setMediaUri(response.assets[0].uri);
          setIsVideo(true);
          if (response.assets[0].width && response.assets[0].height) {
            setMediaDimensions({
              width: response.assets[0].width,
              height: response.assets[0].height,
            });
          } else {
            setMediaDimensions(null);
          }
        }
      },
    );
  };

  const handleEditPress = () => {
    if (!mediaUri) {
      Alert.alert(getLocalizedText('提示', 'Tip'), getLocalizedText('请先选择视频', 'Please select a video first'));
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
    setMediaDimensions(null);
  };

  const boxWidth = screenWidth * 0.9;
  let dynamicVideoBoxHeight = height * 0.5; // Default height

  if (mediaUri && mediaDimensions) {
    const aspectRatio = mediaDimensions.width / mediaDimensions.height;
    dynamicVideoBoxHeight = boxWidth / aspectRatio;
  }

  // Ensure height is within reasonable bounds
  dynamicVideoBoxHeight = Math.min(dynamicVideoBoxHeight, height * 0.7); // Max height
  dynamicVideoBoxHeight = Math.max(dynamicVideoBoxHeight, height * 0.3); // Min height

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
      {/* 顶部标题 */}
      <View style={styles.pageHeaderContainer}>
        <Text style={styles.pageHeaderTitle}>{getLocalizedText('剪辑', 'Edit')}</Text>
      </View>

      <View style={styles.mainContentContainer}>
        <View style={[styles.videoDisplayBox, { height: dynamicVideoBoxHeight }]}>
          {mediaUri ? (
            isVideo ? (
              <Video
                source={{ uri: mediaUri }}
                style={styles.mediaContent}
                controls={true}
                resizeMode="contain"
                onError={(error: any) => {
                  Alert.alert('错误', `视频播放失败: ${error.message}`);
                }}
              />
            ) : (
              <Image
                source={{ uri: mediaUri }}
                style={styles.mediaContent}
                resizeMode="contain"
              />
            )
          ) : (
            <Text style={styles.placeholderText}>{getLocalizedText('视频/图片将在此显示', 'Video/Image will appear here')}</Text>
          )}
        </View>

        {!mediaUri ? (
          <View style={styles.initialButtonContainer}>
            <TouchableOpacity
              style={styles.customButton}
              onPress={pickVideo}
            >
              <Text style={styles.buttonText}>{getLocalizedText('选择视频', 'Select Video')}</Text>
              <Image
                source={require('../Images/MediaPickerScreen/robot1.png')}
                style={[styles.robotIcon, styles.robotIconLeft]}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.customButton}
              onPress={captureVideo}
            >
              <Text style={styles.buttonText}>{getLocalizedText('录制视频', 'Record Video')}</Text>
              <Image
                source={require('../Images/MediaPickerScreen/robot2.png')}
                style={[styles.robotIcon, styles.robotIconRight]}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              style={[styles.globalButton, {backgroundColor: 'rgb(120,121,241)'}]}
              onPress={handleEditPress}
              activeOpacity={0.8}
            >
              <Text style={styles.globalButtonLabel}>{getLocalizedText('编辑', 'Edit')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.globalButton, {backgroundColor: '#B0B0B0'}]}
              onPress={handleClearMedia}
              activeOpacity={0.8}
            >
              <Text style={styles.globalButtonLabel}>{getLocalizedText('重选', 'Reselect')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ImageBackground>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mainContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10, // Consistent spacing from top
    paddingBottom: 0,
  },
  videoDisplayBox: {
    width: width * 0.9,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  mediaContent: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholderText: {
    color: 'white',
    fontSize: 20,
  },
  initialButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 30,
  },
  customButton: {
    width: width * 0.8,
    height: 60,
    backgroundColor: 'rgb(120, 121, 241)',
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 60,
    position: 'relative',
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  robotIcon: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    position: 'absolute',
    top: '5%',
    transform: [{ translateY: -20 }],
  },
  robotIconLeft: {
    left: -12,
  },
  robotIconRight: {
    right: -12,
  },
  actionButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  imageActionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  actionButtonImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 8,
  },
  actionButtonLabel: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  pageHeaderContainer: { // New page header container style
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    top: 50, // This might need further adjustment after testing on device
    zIndex: 10,
    marginBottom: 0, // Consistent spacing below the title
  },
  pageHeaderTitle: { // New page header title style
    fontSize: 28, // Standardized font size
    fontWeight: 'bold',
    color: 'white',
    top: 35,
  },
  globalButton: {
    minWidth: 110,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 18,
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  globalButtonLabel: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
});

export default MediaPickerScreen;
