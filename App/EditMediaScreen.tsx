import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
  ImageBackground,
  Keyboard,
} from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import Video from 'react-native-video';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import ChatScreen from './components/ChatScreen';


const audioRecorderPlayer = new AudioRecorderPlayer();

interface RouteParams {
  mediaUri: string;
  isVideo: boolean;
}

interface Props {
  route: {
    params: RouteParams;
  };
  navigation: any;
}

interface VideoError {
  error: {
    errorString?: string;
    code?: string;
    domain?: string;
  };
}

const EditMediaScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mediaUri, isVideo } = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const [textInput, setTextInput] = useState<string>('');
  const [isRecordingMode, setIsRecordingMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoRenderedHeight, setVideoRenderedHeight] = useState(0);
  const videoRef = useRef(null);
  const [videoPath, setVideoPath] = useState<string | null>(null);

  useEffect(() => {
    if (isVideo) {
      setVideoPath(mediaUri);
    }
  }, [mediaUri, isVideo]);

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // 当键盘显示时隐藏底部导航栏
        navigation.getParent()?.setOptions({
          tabBarStyle: { display: 'none' }
        });
      }
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        // 当键盘隐藏时显示底部导航栏
        navigation.getParent()?.setOptions({
          tabBarStyle: {
            display: 'flex',
            height: 60,
            paddingBottom: 10,
            paddingTop: 5,
          }
        });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
      // 确保在组件卸载时恢复底部导航栏
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          display: 'flex',
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
        }
      });
    };
  }, [navigation]);

  // const handleSendText = () => {
  //   if (textInput.trim()) {
  //     // 这里处理发送文本的逻辑
  //     // Alert.alert('发送成功', textInput);
  //     setTextInput(''); // 发送后清空输入框
  //   }
  // };

  // const startRecording = async () => {
  //   try {
  //     setIsRecording(true);
  //     await audioRecorderPlayer.startRecorder();
  //     audioRecorderPlayer.addRecordBackListener((e) => {
  //       // 可以在这里处理录音进度
  //     });
  //   } catch (error) {
  //     Alert.alert('错误', `录音失败: ${error.message}`);
  //     setIsRecording(false);
  //   }
  // };

  // const stopRecording = async () => {
  //   try {
  //     const result = await audioRecorderPlayer.stopRecorder();
  //     audioRecorderPlayer.removeRecordBackListener();
  //     setIsRecording(false);
  //     Alert.alert('提示', `录音已保存: ${result}`);
  //   } catch (error) {
  //     Alert.alert('错误', `停止录音失败: ${error.message}`);
  //     setIsRecording(false);
  //   }
  // };

  const toggleInputMode = () => {
    setIsRecordingMode(!isRecordingMode);
  };

  const handleVideoLoad = (data: any) => {
    setDuration(data.duration);
  };

  const handleProgress = (data: any) => {
    setCurrentTime(data.currentTime);
  };

  const handleSelectTime = (time: number) => {
    // Implementation needed
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMediaLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setVideoRenderedHeight(height);
  };

  return (
    <ImageBackground
      source={require('../Images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.videoContainer}>
          <ImageBackground
            source={require('../Images/EditMediaScreen/show_video.png')}
            style={styles.videoFrame}
            resizeMode="stretch"
          >
            {isVideo && videoPath && (
              <Video
                ref={videoRef}
                source={{ uri: videoPath }}
                style={styles.video}
                resizeMode="contain"
                controls={true}
                onLoad={handleVideoLoad}
                onProgress={handleProgress}
                onLayout={handleMediaLayout}
              />
            )}
            {!isVideo && (
              <Image
                source={{ uri: mediaUri }}
                style={styles.video}
                resizeMode="contain"
                onLayout={handleMediaLayout}
              />
            )}
          </ImageBackground>
        </View>

        <View style={styles.chatContainer}>
          <ChatScreen />
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingTop: 20,
  },
  videoContainer: {
    width: width,
    height: width * 0.6, // 调整高度比例
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  videoFrame: {
    marginTop: 80,
    width: width * 0.95, // 视频框宽度为屏幕宽度的95%
    height: width * 0.5, // 保持合适的宽高比
    justifyContent: 'center',
    alignItems: 'center',

  },
  video: {
    width: width * 0.85, // 视频宽度略小于框架
    height: width * 0.48, // 保持视频的宽高比
  },
  chatContainer: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  mainContainer: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 20,
  },
  mediaContainer: {
    width: width * 0.95,
    height: width * 0.65,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaWrapper: {
    width: '90%',
    height: '90%',
    borderRadius: 10,
  },
  media: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  coordinates: {
    display: 'none', // 隐藏坐标显示样式
  },
  bottomContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputBackground: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  textInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  sendButton: {
    marginLeft: 8,
    height: 40,
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  voiceButton: {
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    marginRight: 10,
  },
  voiceButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  recordButton: {
    flex: 1,
    height: 40,
    backgroundColor: '#4CAF50',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recording: {
    backgroundColor: '#FF4444',
  },
  recordButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  frameSliderContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default EditMediaScreen;