import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const audioRecorderPlayer = new AudioRecorderPlayer();

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

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayAudio = async () => {
        if (message.type === 'audio' && message.audioPath) {
            try {
                if (isPlaying) {
                    await audioRecorderPlayer.stopPlayer();
                    setIsPlaying(false);
                } else {
                    await audioRecorderPlayer.startPlayer(message.audioPath);
                    setIsPlaying(true);
                    
                    // 监听播放完成事件
                    audioRecorderPlayer.addPlayBackListener((e) => {
                        if (e.currentPosition === e.duration) {
                            setIsPlaying(false);
                            audioRecorderPlayer.stopPlayer();
                        }
                    });
                }
            } catch (error) {
                console.error('播放音频失败:', error);
            }
        }
    };

    const renderContent = () => {
        switch (message.type) {
            case 'audio':
                return (
                    <TouchableOpacity
                        style={styles.audioButton}
                        onPress={handlePlayAudio}
                    >
                        <Image
                            source={require('../../Images/EditMediaScreen/send_instruction.png')}
                            style={styles.playIcon}
                        />
                        <Text style={styles.audioText}>
                            {isPlaying ? '正在播放...' : '点击播放语音'}
                        </Text>
                    </TouchableOpacity>
                );
            case 'preview':
                return (
                    <View style={styles.previewContainer}>
                        <Text style={styles.text}>{message.text}</Text>
                        <View style={styles.previewButtons}>
                            <TouchableOpacity
                                style={[styles.selectButton]}
                                onPress={() => {
                                    console.log('ChatMessage: 选择按钮被点击');
                                    if (message.onPreview) {
                                        message.onPreview();
                                    }
                                }}
                            >
                                <Text style={styles.buttonText}>选择</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            default:
                return (
                    <Text style={[
                        styles.text,
                        message.isUser ? styles.userText : styles.systemText
                    ]}>
                        {message.text}
                    </Text>
                );
        }
    };

    return (
        <View style={[
            styles.container,
            message.isUser ? styles.userContainer : styles.systemContainer
        ]}>
            <View style={[
                styles.bubble,
                message.isUser ? styles.userBubble : styles.systemBubble
            ]}>
                {renderContent()}
            </View>
            {message.isUser && (
                <Image
                    source={require('../../Images/EditMediaScreen/user_image.png')}
                    style={styles.avatar}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginVertical: 5,
        paddingHorizontal: 10,
    },
    userContainer: {
        justifyContent: 'flex-end',
    },
    systemContainer: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
    },
    userBubble: {
        backgroundColor: '#4CAF50',
        borderBottomRightRadius: 4,
    },
    systemBubble: {
        backgroundColor: '#424242',
        borderBottomLeftRadius: 4,
    },
    text: {
        fontSize: 16,
        lineHeight: 20,
        color: '#fff',
    },
    userText: {
        color: '#fff',
    },
    systemText: {
        color: '#fff',
    },
    audioButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    playIcon: {
        width: 20,
        height: 20,
        tintColor: '#fff',
        marginRight: 8,
    },
    audioText: {
        color: '#fff',
        fontSize: 16,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    previewContainer: {
        width: '100%',
    },
    previewButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    selectButton: {
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 20,
        backgroundColor: '#4CAF50',
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ChatMessage;