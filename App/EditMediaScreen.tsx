import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  useColorScheme,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { TapGestureHandler } from 'react-native-gesture-handler';
import Video from 'react-native-video';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

const EditMediaScreen: React.FC = ({ route }) => {
  const { mediaUri, isVideo } = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);
  const [textInput, setTextInput] = useState<string>('');
  const [isRecordingMode, setIsRecordingMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRef = useRef<View>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const safePadding = '5%';

  const handlePress = (event: any) => {
    const { x, y } = event.nativeEvent;
    const mediaWidth = width * 0.9;
    const mediaHeight = width * 0.6;
    const scaleX = 1;
    const scaleY = 1;
    const relativeX = Math.round(x / scaleX);
    const relativeY = Math.round(y / scaleY);
    setClickPosition({ x: relativeX, y: relativeY });
  };

  const startRecording = async () => {
    try {
      setIsRecording(true);
      await audioRecorderPlayer.startRecorder();
      audioRecorderPlayer.addRecordBackListener((e) => {
        // 可以在这里处理录音进度
      });
    } catch (error) {
      Alert.alert('错误', `录音失败: ${error.message}`);
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      const result = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
      setIsRecording(false);
      Alert.alert('提示', `录音已保存: ${result}`);
    } catch (error) {
      Alert.alert('错误', `停止录音失败: ${error.message}`);
      setIsRecording(false);
    }
  };

  const toggleInputMode = () => {
    setIsRecordingMode(!isRecordingMode);
  };

  return (
    <View style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView style={backgroundStyle}>
        <View style={[styles.container, { paddingHorizontal: safePadding, paddingBottom: safePadding }]}>
          <Text style={[styles.title, { color: isDarkMode ? Colors.white : Colors.black }]}>
            编辑媒体 - 点击显示坐标
          </Text>
          <TapGestureHandler
            onHandlerStateChange={({ nativeEvent }) => {
              if (nativeEvent.state === 5) {
                handlePress({ nativeEvent });
              }
            }}
          >
            <View ref={mediaRef} style={[styles.mediaContainer, { overflow: 'hidden' }]}>
              {isVideo ? (
                <Video
                  source={{ uri: mediaUri }}
                  style={styles.media}
                  controls={true}
                  resizeMode="contain"
                  onError={(error: any) => {
                    Alert.alert('错误', `视频播放失败: ${error.error.errorString || error.message}`);
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
          </TapGestureHandler>
          {clickPosition && (
            <Text style={[styles.coordinates, { color: isDarkMode ? Colors.white : Colors.black }]}>
              点击坐标: X: {clickPosition.x}, Y: {clickPosition.y}
            </Text>
          )}
          {isVideo && (
            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={toggleInputMode} style={styles.voiceButton}>
                <Text style={styles.voiceButtonText}>{isRecordingMode ? '切换到文本' : '切换到语音'}</Text>
              </TouchableOpacity>
              {isRecordingMode ? (
                <TouchableOpacity
                  style={[styles.recordButton, isRecording && styles.recording]}
                  onPressIn={startRecording}
                  onPressOut={stopRecording}
                >
                  <Text style={styles.recordButtonText}>
                    {isRecording ? '松开结束' : '按住说话'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      backgroundColor: isDarkMode ? '#333' : '#FFF',
                      color: isDarkMode ? Colors.white : Colors.black,
                      borderColor: isDarkMode ? '#555' : '#CCC',
                    },
                  ]}
                  placeholder="输入文本..."
                  placeholderTextColor={isDarkMode ? '#888' : '#999'}
                  value={textInput}
                  onChangeText={setTextInput}
                />
              )}
            </View>
          )}
          {textInput && !isRecordingMode && (
            <Text style={[styles.textOutput, { color: isDarkMode ? Colors.white : Colors.black }]}>
              输入内容: {textInput}
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginVertical: 20,
  },
  mediaContainer: {
    width: '100%',
    alignItems: 'center',
  },
  media: {
    width: width * 0.9,
    height: width * 0.6,
    borderRadius: 10,
  },
  coordinates: {
    fontSize: 18,
    marginTop: 20,
    fontWeight: '400',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 10,
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
  textInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
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
  textOutput: {
    fontSize: 18,
    marginTop: 10,
    fontWeight: '400',
  },
});

export default EditMediaScreen;