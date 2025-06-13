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
  PermissionsAndroid,
  Linking,
  Permission,
} from 'react-native';
import Video, { VideoRef } from 'react-native-video';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import ChatScreen from './components/ChatScreen';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { checkStoragePermissions, requestStoragePermissions } from './utils/permissionManager';

// API配置
const API_CONFIG = {
  BASE_URL: 'http://139.224.33.240:8000',
  ENDPOINTS: {
    PROCESS_VIDEO: '/process-video',
    CHECK_FILE: '/check-file'
  }
};

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
    errorException?: string;
    errorStackTrace?: string;
    errorCode?: string;
    error?: string;
    domain?: string;
  };
  target?: number;
}

interface ProcessVideoResponse {
  status: string;
  message: string;
  result: string;
  output_path?: string;
}

const EditMediaScreen: React.FC<Props> = ({ route, navigation }) => {
  const { mediaUri: initialMediaUri, isVideo } = route.params;
  const isDarkMode = useColorScheme() === 'dark';
  const [textInput, setTextInput] = useState<string>('');
  const [isRecordingMode, setIsRecordingMode] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoRenderedHeight, setVideoRenderedHeight] = useState(0);
  const videoRef = useRef<VideoRef>(null);
  const [videoPath, setVideoPath] = useState<string>(initialMediaUri);
  const [currentMediaUri, setCurrentMediaUri] = useState<string>(initialMediaUri);
  const [processedVideos, setProcessedVideos] = useState<Array<{
    path: string;
    timestamp: number;
  }>>([]);
  const [currentProcessedVideo, setCurrentProcessedVideo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastUploadedUri, setLastUploadedUri] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    isUser: boolean;
    type: 'text' | 'audio' | 'preview';
    videoPath?: string;
    onSave?: () => Promise<void>;
    onDiscard?: () => Promise<void>;
    onPreview?: () => void;
  }>>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [previewVideoPath, setPreviewVideoPath] = useState<string | null>(null);
  const [localSavedPath, setLocalSavedPath] = useState<string | null>(null);
  const [hasStoragePermission, setHasStoragePermission] = useState(false);

  useEffect(() => {
    if (isVideo && initialMediaUri) {
      setVideoPath(initialMediaUri);
    }
  }, [initialMediaUri, isVideo]);

  // 检查权限状态
  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await checkStoragePermissions();
      setHasStoragePermission(hasPermission);
    };
    checkPermissions();
  }, []);

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

  const checkAndUploadVideo = async (uri: string): Promise<boolean> => {
    if (!uri) {
      console.error('视频URI为空');
      Alert.alert('错误', '无效的视频路径');
      return false;
    }

    if (uri === lastUploadedUri) {
      console.log('视频已经上传过，无需重新上传');
      return true;
    }

    setIsUploading(true);
    try {
      console.log('准备上传视频:', uri);
      // 检查文件是否存在
      try {
        const fileExists = await RNFS.exists(uri.replace('file://', ''));
        if (!fileExists) {
          throw new Error('视频文件不存在');
        }
        console.log('本地文件检查通过');
      } catch (error: any) {
        console.error('文件检查失败:', error);
        throw new Error(`文件检查失败: ${error.message}`);
      }

      // 先检查文件是否已经上传
      const filename = uri.split('/').pop() || '';
      console.log('检查文件是否已上传:', filename);

      try {
        const checkResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK_FILE}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filename }),
        });

        if (!checkResponse.ok) {
          throw new Error(`服务器响应错误: ${checkResponse.status}`);
        }

        const checkData = await checkResponse.json();
        console.log('检查文件响应:', checkData);

        if (checkData.status === 'success' && checkData.exists) {
          console.log('文件已存在于服务器');
          setLastUploadedUri(uri);
          return true;
        }
      } catch (error) {
        console.error('检查文件状态失败:', error);
        // 继续尝试上传
      }

      // 如果文件不存在，则上传
      console.log('开始构建上传表单');
      const formData = new FormData();
      formData.append('video', {
        uri: uri,
        type: 'video/mp4',
        name: filename,
      } as any);

      console.log('发送上传请求');
      const response = await fetch(`${API_CONFIG.BASE_URL}/upload-video`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('上传响应错误:', {
          status: response.status,
          statusText: response.statusText,
          errorText
        });
        throw new Error(`上传失败: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('上传响应:', data);

      if (data.status === 'success') {
        console.log('视频上传成功');
        setLastUploadedUri(uri);
        return true;
      } else {
        throw new Error(data.message || '上传失败');
      }
    } catch (error: any) {
      console.error('上传视频失败:', error);
      Alert.alert('错误', `上传视频失败: ${error.message}`);
      return false;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelectVideo = async (videoPath: string) => {
    try {
      console.log('开始选择视频:', videoPath);

      // 检查文件路径格式
      if (!videoPath.startsWith('file://')) {
        videoPath = 'file://' + (videoPath.startsWith('/') ? videoPath : '/' + videoPath);
      }
      console.log('格式化后的视频路径:', videoPath);

      // 更新显示的视频
      setVideoPath(videoPath);
      // 更新待编辑的视频路径
      setCurrentMediaUri(videoPath);
      // 重置上传状态
      setLastUploadedUri(null);
      setIsPlaying(true);

      // 添加选择确认消息
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: '已选择此版本视频进行后续编辑',
        isUser: false,
        type: 'text'
      }]);

      // 预先上传新选择的视频
      console.log('开始预上传视频');
      const uploadSuccess = await checkAndUploadVideo(videoPath);
      if (!uploadSuccess) {
        console.error('预上传视频失败');
        Alert.alert('警告', '视频预上传失败，可能影响后续编辑操作');
      } else {
        console.log('预上传视频成功');
      }
    } catch (error: any) {
      console.error('选择视频时出错:', error);
      Alert.alert('错误', `选择视频失败: ${error.message}`);
    }
  };

  // 修改下载视频的函数
  const downloadVideo = async (url: string): Promise<string | null> => {
    try {
      console.log('开始下载视频:', url);

      // 检查权限
      if (Platform.OS === 'android') {
        const writePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "存储权限",
            message: "需要存储权限才能下载视频",
            buttonNeutral: "稍后询问",
            buttonNegative: "取消",
            buttonPositive: "确定"
          }
        );
        if (writePermission !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('需要存储权限才能下载视频');
        }
      }

      // 创建本地文件路径
      const timestamp = new Date().getTime();
      const localPath = `${RNFS.CachesDirectoryPath}/temp_video_${timestamp}.mp4`;

      console.log('本地保存路径:', localPath);

      // 下载文件
      const response = await RNFS.downloadFile({
        fromUrl: url,
        toFile: localPath,
        background: true,
        discretionary: true,
        progress: (res) => {
          const progressPercent = ((res.bytesWritten / res.contentLength) * 100).toFixed(0);
          console.log(`下载进度: ${progressPercent}%`);
        }
      }).promise;

      console.log('下载响应:', response);

      // 验证下载是否成功
      const fileExists = await RNFS.exists(localPath);
      if (!fileExists) {
        throw new Error('下载完成但文件不存在');
      }

      const fileSize = await RNFS.stat(localPath);
      console.log('下载文件大小:', fileSize.size);

      if (fileSize.size === 0) {
        throw new Error('下载的文件大小为0');
      }

      return localPath;
    } catch (error: any) {
      console.error('下载视频失败:', error);
      Alert.alert('错误', `下载视频失败: ${error.message}`);
      throw new Error(`下载视频失败: ${error.message}`);
    }
  };

  const handlePreviewVideo = () => {
    console.log('预览按钮被点击');
    console.log('处理后的视频路径:', currentProcessedVideo);
    if (currentProcessedVideo) {
      console.log('切换到处理后的视频');
      setVideoPath(currentProcessedVideo);
      setIsPlaying(true); // 确保视频开始播放
    }
  };

  const handleDiscardPreview = async () => {
    console.log('放弃按钮被点击');
    // 恢复原始视频
    setVideoPath(initialMediaUri);
    setIsPlaying(true);
    // 如果有临时文件，删除它
    if (currentProcessedVideo) {
      try {
        await RNFS.unlink(currentProcessedVideo);
        console.log('临时文件删除成功');
        setCurrentProcessedVideo(null);
      } catch (error) {
        console.error('删除临时文件失败:', error);
      }
    }
  };

  const handleExportVideo = async () => {
    if (!videoPath) {
      Alert.alert('错误', '没有可导出的视频');
      return;
    }

    try {
      console.log('开始导出视频:', videoPath);

      // 检查权限
      const hasPermission = await requestStoragePermissions();
      if (!hasPermission) {
        throw new Error('需要存储权限才能导出视频');
      }

      // 确保文件路径格式正确
      let filePath = videoPath;
      if (!filePath.startsWith('file://')) {
        filePath = 'file://' + (filePath.startsWith('/') ? filePath : '/' + filePath);
      }

      // 检查文件是否存在
      const fileExists = await RNFS.exists(filePath.replace('file://', ''));
      if (!fileExists) {
        throw new Error('视频文件不存在');
      }

      // 使用CameraRoll保存到相册
      await CameraRoll.save(filePath, {
        type: 'video',
        album: 'ClipPersona'
      });

      Alert.alert('成功', '视频已成功导出到相册');
    } catch (error: any) {
      console.error('导出视频失败:', error);
      Alert.alert('错误', `导出视频失败: ${error.message}`);
    }
  };

  const handleProcessedVideo = async (localPath: string) => {
    // 将新处理的视频添加到列表中
    const newVideo = {
      path: localPath,
      timestamp: Date.now()
    };
    setProcessedVideos(prev => [...prev, newVideo]);
    setCurrentProcessedVideo(localPath);

    // 添加消息
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: '视频处理完成，点击"选择"可以使用此版本继续编辑',
      isUser: false,
      type: 'preview',
      videoPath: localPath,
      onPreview: () => handleSelectVideo(localPath)
    }]);
  };

  const handleNaturalLanguageCommand = async (command: string) => {
    if (!currentMediaUri) {
      Alert.alert('错误', '没有选择视频');
      return;
    }

    if (isProcessing) {
      Alert.alert('提示', '视频正在处理中，请稍候...');
      return;
    }

    setIsProcessing(true);
    try {
      // 检查并上传视频
      const uploadSuccess = await checkAndUploadVideo(currentMediaUri);
      if (!uploadSuccess) {
        throw new Error('视频上传失败');
      }

      // 首先发送到 nlp_parser 进行解析
      const nlpResponse = await fetch(`${API_CONFIG.BASE_URL}/process-video`, {
        method: 'POST',
        body: (() => {
          const formData = new FormData();
          formData.append('video', {
            uri: currentMediaUri,
            type: 'video/mp4',
            name: currentMediaUri.split('/').pop() || 'video.mp4',
          } as any);
          formData.append('instruction', command);
          return formData;
        })(),
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
      });

      if (!nlpResponse.ok) {
        throw new Error('处理指令失败');
      }

      const data = await nlpResponse.json();

      // 显示 NLP 解析的回复
      if (data.message) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: data.message,
          isUser: false,
          type: 'text'
        }]);
      }

      if (data.status === 'success' && data.output_path) {
        try {
          const videoUrl = `${API_CONFIG.BASE_URL}${data.output_path}`;
          const localPath = await downloadVideo(videoUrl);
          if (!localPath) {
            throw new Error('下载处理后的视频失败');
          }
          await handleProcessedVideo(localPath);
        } catch (error: any) {
          console.error('处理视频结果时出错:', error);
          Alert.alert('错误', `处理视频失败: ${error.message}`);
        }
      } else {
        Alert.alert('错误', data.message || '处理视频失败');
      }
    } catch (error: any) {
      console.error('处理视频时出错:', error);
      Alert.alert('错误', `处理视频失败: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 修改视频错误处理函数
  const handleVideoError = (e: Readonly<VideoError>) => {
    console.error('视频播放错误:', e.error);
    Alert.alert('错误', '视频播放失败，请重试');
  };

  // 修改保存和放弃的处理函数
  const handleSaveVideo = async () => {
    console.log('保存按钮被点击');
    if (!currentProcessedVideo) {
      console.error('没有处理后的视频可保存');
      Alert.alert('错误', '没有可保存的视频');
      return;
    }

    try {
      console.log('开始保存视频:', currentProcessedVideo);

      // 检查权限
      const hasPermission = await requestStoragePermissions();
      if (!hasPermission) {
        throw new Error('需要存储权限才能保存视频');
      }

      // 确保文件路径格式正确
      let filePath = currentProcessedVideo;
      if (!filePath.startsWith('file://')) {
        filePath = 'file://' + (filePath.startsWith('/') ? filePath : '/' + filePath);
      }

      console.log('准备保存的文件路径:', filePath);

      // 检查文件是否存在
      const fileExists = await RNFS.exists(filePath.replace('file://', ''));
      if (!fileExists) {
        throw new Error('视频文件不存在');
      }

      // 使用CameraRoll保存到相册
      await CameraRoll.save(filePath, {
        type: 'video',
        album: 'ClipPersona'
      });

      console.log('视频成功保存到相册');

      // 添加成功消息
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: '视频已成功保存到相册',
        isUser: false,
        type: 'text'
      }]);

      Alert.alert('成功', '视频已保存到相册');

      // 清理临时文件
      try {
        await RNFS.unlink(filePath.replace('file://', ''));
        console.log('临时文件删除成功');
        setCurrentProcessedVideo(null);
      } catch (error) {
        console.error('删除临时文件失败:', error);
      }
    } catch (error: any) {
      console.error('保存视频失败:', error);
      Alert.alert('错误', `保存视频失败: ${error.message}`);
    }
  };

  const handleDiscardChanges = async () => {
    if (localSavedPath) {
      try {
        // 删除临时文件
        await RNFS.unlink(localSavedPath);
      } catch (error) {
        console.error('删除临时文件失败:', error);
      }
    }
    setPreviewVideoPath(null);
    setLocalSavedPath(null);

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: '已放弃修改',
      isUser: false,
      type: 'text'
    }]);
  };

  // 添加导出按钮组件
  const ExportButton = () => (
    <TouchableOpacity
      style={styles.exportButton}
      onPress={handleExportVideo}
    >
      <Text style={styles.exportButtonText}>导出</Text>
    </TouchableOpacity>
  );

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
          <ExportButton />
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
                onError={handleVideoError}
                paused={!isPlaying || isProcessing}
              />
            )}
            {!isVideo && (
              <Image
                source={{ uri: currentMediaUri }}
                style={styles.video}
                resizeMode="contain"
                onLayout={handleMediaLayout}
              />
            )}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <Text style={styles.processingText}>处理中...</Text>
              </View>
            )}

          </ImageBackground>
        </View>

        <View style={styles.chatContainer}>
          <ChatScreen
            onSendCommand={handleNaturalLanguageCommand}
            disabled={isProcessing || isUploading}
            messages={messages}
            setMessages={setMessages}
          />
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
    height: width * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  videoFrame: {
    marginTop: 160,
    width: width,
    height: width * 9 / 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '85%',
    height: '85%',
  },
  chatContainer: {
    marginTop: 50,
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  exportButton: {
    position: 'absolute',
    marginTop: 40,
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  // ... 其他样式 ...
});

export default EditMediaScreen;

