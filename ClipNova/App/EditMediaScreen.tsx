import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { saveDraftVideo, DraftVideo } from './utils/draftVideoManager';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from './context/LanguageContext';

// API配置
const API_CONFIG = {
  BASE_URL: 'http://100.77.182.178:8000',
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
  const { currentLanguage } = useLanguage();

  // 辅助函数：根据当前语言获取文本
  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
  };

  // 新增：自动保存草稿的函数
  const autoSaveDraft = useCallback(async () => {
    if (currentProcessedVideo) {
      console.log(getLocalizedText('检测到未保存的草稿视频，尝试自动保存...', 'Unsaved draft video detected, attempting auto-save...'));
      const draftName = getLocalizedText(`草稿_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}`, `Draft_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}`);
      const savedDraft = await saveDraftVideo({
        name: draftName,
        path: currentProcessedVideo,
      });

      if (savedDraft) {
        console.log('临时草稿视频自动保存成功:', savedDraft.path);
        // 自动保存后，清理 currentProcessedVideo，避免重复保存或影响下次编辑
        setCurrentProcessedVideo(null);
      } else {
        console.error('临时草稿视频自动保存失败。');
      }
    }
  }, [currentProcessedVideo]);

  // 使用 useFocusEffect 在屏幕失去焦点时触发自动保存
  useFocusEffect(
    useCallback(() => {
      return () => {
        // 当屏幕失去焦点或组件卸载时，执行自动保存
        autoSaveDraft();
      };
    }, [autoSaveDraft]) // 依赖 autoSaveDraft 确保在它改变时 effect 会重新注册
  );

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
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText('无效的视频路径', 'Invalid video path'));
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
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText(`上传视频失败: ${error.message}`, `Video upload failed: ${error.message}`));
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
        text: getLocalizedText('已选择此版本视频进行后续编辑', 'This version of the video has been selected for further editing'),
        isUser: false,
        type: 'text'
      }]);

      // 预先上传新选择的视频
      console.log('开始预上传视频');
      const uploadSuccess = await checkAndUploadVideo(videoPath);
      if (!uploadSuccess) {
        console.error('预上传视频失败');
        Alert.alert(getLocalizedText('警告', 'Warning'), getLocalizedText('视频预上传失败，可能影响后续编辑操作', 'Video pre-upload failed, which may affect subsequent editing operations'));
      } else {
        console.log('预上传视频成功');
      }
    } catch (error: any) {
      console.error('选择视频时出错:', error);
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText(`选择视频失败: ${error.message}`, `Failed to select video: ${error.message}`));
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
            title: getLocalizedText('存储权限', 'Storage Permission'),
            message: getLocalizedText('需要存储权限才能下载视频', 'Storage permission is required to download videos.'),
            buttonNeutral: getLocalizedText('稍后询问', 'Ask Later'),
            buttonNegative: getLocalizedText('取消', 'Cancel'),
            buttonPositive: getLocalizedText('确定', 'OK')
          }
        );
        if (writePermission !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error(getLocalizedText('需要存储权限才能下载视频', 'Storage permission required to download video'));
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
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText(`下载视频失败: ${error.message}`, `Video download failed: ${error.message}`));
      throw new Error(getLocalizedText(`下载视频失败: ${error.message}`, `Video download failed: ${error.message}`));
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
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText('没有可导出的视频', 'No video to export'));
      return;
    }

    try {
      console.log('开始导出视频:', videoPath);

      // 检查权限
      const hasPermission = await requestStoragePermissions();
      if (!hasPermission) {
        throw new Error(getLocalizedText('需要存储权限才能导出视频', 'Storage permission required to export video'));
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

      Alert.alert(getLocalizedText('成功', 'Success'), getLocalizedText('视频已成功导出到相册', 'Video successfully exported to album'));
    } catch (error: any) {
      console.error('导出视频失败:', error);
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText(`导出视频失败: ${error.message}`, `Video export failed: ${error.message}`));
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
      text: getLocalizedText('视频处理完成，点击"选择"可以使用此版本继续编辑', 'Video processing complete, click "Select" to continue editing with this version'),
      isUser: false,
      type: 'preview',
      videoPath: localPath,
      onPreview: () => handleSelectVideo(localPath)
    }]);
  };

  const handleNaturalLanguageCommand = async (command: string) => {
    if (!currentMediaUri) {
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText('没有选择视频', 'No video selected'));
      return;
    }

    if (isProcessing) {
      Alert.alert(getLocalizedText('提示', 'Tip'), getLocalizedText('视频正在处理中，请稍候...', 'Video is processing, please wait...'));
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
        const errorBody = await nlpResponse.text();
        console.error(
          `处理指令失败: 状态码 ${nlpResponse.status}, 状态文本: ${nlpResponse.statusText}, 响应体: ${errorBody}`
        );
        throw new Error(
          `处理指令失败: ${nlpResponse.status} ${nlpResponse.statusText} - ${errorBody.substring(0, 100)}...`
        );
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
          Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText(`处理视频失败: ${error.message}`, `Video processing failed: ${error.message}`));
        }
      } else {
        Alert.alert(getLocalizedText('错误', 'Error'), data.message || getLocalizedText('处理视频失败', 'Video processing failed'));
      }
    } catch (error: any) {
      console.error('处理视频时出错:', error.message, error.stack);
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText(`处理视频失败: ${error.message}`, `Video processing failed: ${error.message}`));
    } finally {
      setIsProcessing(false);
    }
  };

  // 修改视频错误处理函数
  const handleVideoError = (e: Readonly<VideoError>) => {
    console.error('视频播放错误:', e.error);
    Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText('视频播放失败，请重试', 'Video playback failed, please try try again'));
  };

  // 修改保存和放弃的处理函数
  const handleSaveVideo = async () => {
    console.log('保存按钮被点击');
    if (!currentProcessedVideo) {
      console.error('没有处理后的视频可保存');
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText('没有可保存的视频', 'No video to save'));
      return;
    }

    try {
      console.log('开始保存视频:', currentProcessedVideo);

      // 检查权限
      const hasPermission = await requestStoragePermissions();
      if (!hasPermission) {
        throw new Error(getLocalizedText('需要存储权限才能保存视频', 'Storage permission required to save video'));
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

      // 新增：保存到草稿
      const draftName = getLocalizedText(`剪辑草稿_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}`, `EditedDraft_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}`);
      const savedDraft = await saveDraftVideo({
        name: draftName,
        path: filePath, // saveDraftVideo 会处理文件复制和前缀
      });

      if (savedDraft) {
        console.log('视频成功保存到草稿:', savedDraft.path);
        // 添加成功消息
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: getLocalizedText(`视频已成功保存到相册和草稿 (${savedDraft.name})`, `Video successfully saved to album and drafts (${savedDraft.name})`),
          isUser: false,
          type: 'text'
        }]);
      } else {
        console.error('视频保存到草稿失败。');
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          text: getLocalizedText('视频已成功保存到相册，但保存到草稿失败。', 'Video successfully saved to album, but failed to save to drafts.'),
          isUser: false,
          type: 'text'
        }]);
      }

      Alert.alert(getLocalizedText('成功', 'Success'), getLocalizedText('视频已保存到相册', 'Video saved to album'));

      // 清理临时文件
      try {
        // 在保存到相册并存储为草稿后，删除临时文件
        await RNFS.unlink(filePath.replace('file://', ''));
        console.log('临时文件删除成功');
        setCurrentProcessedVideo(null); // 清除当前处理中的视频状态
      } catch (error) {
        console.error('删除临时文件失败:', error);
      }
    } catch (error: any) {
      console.error('保存视频失败:', error);
      Alert.alert(getLocalizedText('错误', 'Error'), getLocalizedText(`保存视频失败: ${error.message}`, `Video save failed: ${error.message}`));
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
      text: getLocalizedText('已放弃修改', 'Changes discarded'),
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
      <Text style={styles.exportButtonText}>{getLocalizedText('导出', 'Export')}</Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../Images/background.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View
        style={styles.innerContainer}
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
                <Text style={styles.processingText}>{getLocalizedText('处理中...', 'Processing...')}</Text>
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
      </View>
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
    marginBottom: 25,
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
    marginTop: 100,
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

