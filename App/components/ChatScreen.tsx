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
    Dimensions,
    ImageBackground,
    Image,
    FlatList,
} from 'react-native';
import ChatMessage from './ChatMessage';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    type: 'text' | 'audio';
    audioPath?: string;
}

const ChatScreen: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isRecordingMode, setIsRecordingMode] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);
    const flatListRef = useRef<FlatList>(null);

    const handleSend = () => {
        if (inputText.trim()) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: inputText.trim(),
                isUser: true,
                type: 'text',
            };
            setMessages(prev => [...prev, newMessage]);
            setInputText('');

            // 模拟系统回复
            setTimeout(() => {
                const replyMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: '我已经收到你的指令，正在处理中...',
                    isUser: false,
                    type: 'text',
                };
                setMessages(prev => [...prev, replyMessage]);
            }, 1000);
        }
    };

    const toggleInputMode = () => {
        setIsRecordingMode(!isRecordingMode);
    };

    const startRecording = () => {
        setIsRecording(true);
        // 实现录音逻辑
    };

    const stopRecording = () => {
        setIsRecording(false);
        // 实现停止录音逻辑
        const newMessage: Message = {
            id: Date.now().toString(),
            text: '[语音消息]',
            isUser: true,
            type: 'audio',
        };
        setMessages(prev => [...prev, newMessage]);
    };

    useEffect(() => {
        if (messages.length > 0) {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <ChatMessage message={item} />}
                style={styles.messagesContainer}
                contentContainerStyle={styles.messagesContent}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                style={styles.inputContainer}
            >
                <TouchableOpacity
                    onPress={toggleInputMode}
                    style={styles.modeButton}
                >
                    <ImageBackground
                        source={require('../../Images/EditMediaScreen/mac_background.png')}
                        style={styles.modeIconBackground}
                        resizeMode="cover"
                    >
                        <Image
                            source={isRecordingMode ?
                                require('../../Images/EditMediaScreen/send_instruction_background.png') : // keyboard.png
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
                    <>
                        <View style={styles.textInputContainer}>
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="输入指令..."
                                placeholderTextColor="#999"
                                multiline
                            />
                            <TouchableOpacity
                                style={styles.sendButton}
                                onPress={handleSend}
                                disabled={!inputText.trim()}
                            >
                                <Image
                                    source={require('../../Images/EditMediaScreen/send_instruction.png')}
                                    style={styles.sendIcon}
                                />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
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
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
    },
    textInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        borderRadius: 20,
        paddingHorizontal: 15,
        marginTop: 10,
    },
    input: {
        flex: 1,
        color: '#FFFFFF',
        fontSize: 16,
        paddingVertical: 10,
        maxHeight: 100,
    },
    modeButton: {
        padding: 8,
        marginRight: 8,
    },
    modeIcon: {
        width: 24,
        height: 24,
    },
    modeIconBackground: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: '#333',
        borderRadius: 20,
        paddingVertical: 12,
        alignItems: 'center',
        marginHorizontal: 8,
    },
    recording: {
        backgroundColor: '#444',
    },
    recordButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default ChatScreen; 