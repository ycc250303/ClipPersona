import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Dimensions,
    TouchableOpacity,
} from 'react-native';

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    type: 'text' | 'audio';
    audioPath?: string;
}

interface ChatMessageProps {
    message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const handlePlayAudio = () => {
        if (message.type === 'audio' && message.audioPath) {
            // 实现音频播放逻辑
            console.log('Playing audio:', message.audioPath);
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
                {message.type === 'audio' ? (
                    <TouchableOpacity
                        style={styles.audioButton}
                        onPress={handlePlayAudio}
                    >
                        <Image
                            source={require('../../Images/EditMediaScreen/send_instruction.png')}// 加语音图片
                            style={styles.playIcon}
                        />
                        <Text style={styles.audioText}>点击播放语音</Text>
                    </TouchableOpacity>
                ) : (
                    <Text style={[
                        styles.text,
                        message.isUser ? styles.userText : styles.systemText
                    ]}>
                        {message.text}
                    </Text>
                )}
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
});

export default ChatMessage;