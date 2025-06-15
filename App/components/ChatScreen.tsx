import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ImageBackground,
    Image,
    FlatList,
    PermissionsAndroid,
    Alert,
} from 'react-native';
import ChatMessage from './ChatMessage';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    type: 'text' | 'audio' | 'preview';
    audioPath?: string;
    videoPath?: string;
    onSave?: () => Promise<void>;
    onDiscard?: () => Promise<void>;
    onPreview?: () => void;
}

interface ChatScreenProps {
    onSendCommand: (command: string) => void;
    disabled?: boolean;
    messages: Array<Message>;
    setMessages: React.Dispatch<React.SetStateAction<Array<Message>>>;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const ChatScreen: React.FC<ChatScreenProps> = ({ onSendCommand, disabled = false, messages, setMessages }) => {
    const [inputText, setInputText] = useState('');
    const [isRecordingMode, setIsRecordingMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioPath, setAudioPath] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (disabled || !inputText.trim()) {
            return;
        }

        const userMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isUser: true,
            type: 'text' as const,
        };
        setMessages(prev => [...prev, userMessage]);

        onSendCommand(inputText.trim());
        setInputText('');
    };

    const toggleInputMode = () => {
        setIsRecordingMode(!isRecordingMode);
    };

    const requestAudioPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    {
                        title: "录音权限",
                        message: "需要录音权限才能录制语音消息",
                        buttonNeutral: "稍后询问",
                        buttonNegative: "取消",
                        buttonPositive: "确定"
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const startRecording = async () => {
        const hasPermission = await requestAudioPermission();
        if (!hasPermission) {
            Alert.alert('提示', '需要录音权限才能录制语音消息');
            return;
        }

        try {
            const audioPath = `${RNFS.CachesDirectoryPath}/audio_${Date.now()}.mp3`;
            await audioRecorderPlayer.startRecorder(audioPath);
            setAudioPath(audioPath);
            setIsRecording(true);
        } catch (error) {
            console.error('开始录音失败:', error);
            Alert.alert('错误', '开始录音失败');
        }
    };

    const stopRecording = async () => {
        try {
            const result = await audioRecorderPlayer.stopRecorder();
            setIsRecording(false);
            
            if (audioPath) {
                const newMessage: Message = {
                    id: Date.now().toString(),
                    text: '[语音消息]',
                    isUser: true,
                    type: 'audio',
                    audioPath: audioPath,
                };
                setMessages(prev => [...prev, newMessage]);
                setAudioPath(null);
            }
        } catch (error) {
            console.error('停止录音失败:', error);
            Alert.alert('错误', '停止录音失败');
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatMessage
                        message={{
                            ...item,
                            onSave: item.onSave,
                            onPreview: item.onPreview,
                            onDiscard: item.onDiscard,
                        }}
                    />
                )}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                style={styles.inputContainer}
            >
                <ImageBackground
                    source={require('../../Images/EditMediaScreen/text_and_audio_background.png')}
                    style={styles.inputBackground}
                    resizeMode="stretch"
                >
                    <View style={styles.inputWrapper}>
                        <TouchableOpacity
                            onPress={toggleInputMode}
                            style={styles.modeButton}
                        >
                            <ImageBackground
                                source={require('../../Images/EditMediaScreen/send_instruction_background.png')}
                                style={styles.iconBackground}
                                resizeMode="cover"
                            >
                                <Image
                                    source={isRecordingMode ?
                                        require('../../Images/EditMediaScreen/mac.png') :
                                        require('../../Images/EditMediaScreen/mac.png')
                                    }
                                    style={styles.modeIcon}
                                />
                            </ImageBackground>
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
                            <View style={styles.textInputContainer}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        disabled && styles.inputDisabled
                                    ]}
                                    value={inputText}
                                    onChangeText={setInputText}
                                    placeholder={disabled ? "请等待视频上传完成..." : "输入编辑指令..."}
                                    placeholderTextColor={disabled ? "#666" : "#666"}
                                    multiline
                                    editable={!disabled}
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.sendButton,
                                        (!inputText.trim() || disabled) && styles.sendButtonDisabled
                                    ]}
                                    onPress={handleSend}
                                    disabled={!inputText.trim() || disabled}
                                >
                                    <ImageBackground
                                        source={require('../../Images/EditMediaScreen/send_instruction_background.png')}
                                        style={styles.iconBackground}
                                        resizeMode="cover"
                                    >
                                        <Image
                                            source={require('../../Images/EditMediaScreen/send_instruction.png')}
                                            style={styles.sendIcon}
                                        />
                                    </ImageBackground>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        paddingVertical: 20,
    },
    inputContainer: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    inputBackground: {
        width: '100%',
        height: 60,
        minHeight: 60,
        justifyContent: 'center',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    textInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 14,
        paddingVertical: 10,
        maxHeight: 100,
    },
    modeButton: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    modeIcon: {
        width: 32,
        height: 32,
    },
    sendButton: {
        marginLeft: 8,
        padding: 8,
        opacity: 0.8,
    },
    sendIcon: {
        width: 24,
        height: 24,
        tintColor: '#fff',
    },
    recordButton: {
        flex: 1,
        backgroundColor: 'transparent',
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: 'center',
        marginRight: 10,
    },
    recording: {
        backgroundColor: '#444',
    },
    recordButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    inputDisabled: {
        backgroundColor: '#f0f0f0',
        color: '#999',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    iconBackground: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ChatScreen; 