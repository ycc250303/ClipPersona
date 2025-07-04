import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLanguage } from './context/LanguageContext'; // Assuming context is available

const { width, height } = Dimensions.get('window');

// 模拟评论数据
const dummyComments = [
  {
    id: '1',
    userAvatar: require('../Images/commender.png'), // 占位符头像
    userName: '用户1',
    time: '2小时前',
    commentText: '这个风格卡超好用!让我的视频增色不少!',
  },
  {
    id: '2',
    userAvatar: require('../Images/commender.png'), // 占位符头像
    userName: '用户2',
    time: '1天前',
    commentText: '用起来很顺手，推荐给大家!',
  },
];

const StyleCardDetailScreen: React.FC = ({ navigation, route }: any) => {
  const { currentLanguage } = useLanguage();
  const { card } = route.params; // Get card data from navigation params
  const [activeTab, setActiveTab] = useState('about'); // 'about' or 'comments'
  const [commentInput, setCommentInput] = useState(''); // 评论输入框状态

  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
  };

  // Dummy data for demonstration, replace with actual card data
  const dummyCard = card || {
    id: '1',
    title: getLocalizedText('搞笑弹幕', 'Funny Bullet Comments'),
    shortDescription: getLocalizedText('适合短视频和直播场景的幽默风格', 'Humorous style suitable for short videos and live streams'),
    likes: 50,
    author: getLocalizedText('张三', 'Zhang San'),
    downloads: '1.2k',
    uploadTime: '2025-04-01',
    image: require('../Images/Community/show.png'), // Placeholder image
    longDescription: getLocalizedText(
      '这是一个充满幽默和活力的风格卡，特别适合短视频和直播弹幕场景。它的设计灵感来源于网络热门梗和年轻用户的互动习惯，能够让你在内容瞬间抓住观众的注意力。通过大数据分析，设计师将其优化为快速反应、高互动性的风格。适合需要快节奏的视频内容。使用后，观众反馈互动率提升了30%以上。特别推荐给希望通过幽默元素提升影响力 的创作者。此外，这个风格卡还支持自定义弹幕模板，让你轻松打造个性化效果，是一款兼具趣味性和实用性的优秀工具。',
      "This is a humorous and vibrant style card, especially suitable for short videos and live stream bullet screens. Its design is inspired by popular internet memes and young users' interaction habits, allowing your content to instantly capture viewers' attention. Through big data analysis, designers have optimized it for quick responses and high interactivity. It is suitable for fast-paced video content. After use, audience interaction rates have increased by over 30%. Highly recommended for creators who want to enhance their influence through humorous elements. In addition, this style card also supports custom bullet screen templates, allowing you to easily create personalized effects. It is an excellent tool that combines fun and practicality."
    ),
  };

  return (
    <ImageBackground
      source={require('../Images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getLocalizedText('风格卡详情', 'Style Card Details')}</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={dummyCard.image} style={styles.cardImage} resizeMode="cover" />

        <ImageBackground
          source={require('../Images/Community/text_background.png')}
          style={styles.infoPanelBackground}
          resizeMode="stretch"
        >
          <View style={styles.infoPanelContent}>
            <View style={styles.titleLikeContainer}>
              <Text style={styles.cardTitle}>{dummyCard.title}</Text>
            </View>
            <Text style={styles.shortDescription}>{dummyCard.shortDescription}</Text>
            <View style={styles.metaInfoContainer}>
              <Text style={styles.metaInfoLine}>
                {getLocalizedText('作者：', 'Author: ')}{dummyCard.author}  {getLocalizedText('下载：', 'Downloads: ')}{dummyCard.downloads}
              </Text>
              <Text style={styles.metaInfoLine}>
                {getLocalizedText('上传时间：', 'Upload Time: ')}{dummyCard.uploadTime}
              </Text>
            </View>
            <TouchableOpacity style={styles.downloadButton}>
              <Text style={styles.downloadButtonText}>{getLocalizedText('下载', 'Download')}</Text>
              <Image
                source={require('../Images/MediaPickerScreen/robot2.png')}
                style={styles.downloadRobotIcon}
              />
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <ImageBackground
          source={require('../Images/text.png')}
          style={styles.tabsContainerBackground}
          resizeMode="stretch"
        >
          <View style={styles.tabsContainerInner}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'about' && styles.activeTab]}
              onPress={() => setActiveTab('about')}
            >
              <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>{getLocalizedText('关于它', 'About It')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'comments' && styles.activeTab]}
              onPress={() => setActiveTab('comments')}
            >
              <Text style={[styles.tabText, activeTab === 'comments' && styles.activeTabText]}>{getLocalizedText('评论', 'Comments')}</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>

        <ImageBackground
          source={require('../Images/text.png')}
          style={styles.tabContentBackground}
          resizeMode="stretch"
        >
          <View style={styles.tabContentInner}>
            {activeTab === 'about' ? (
              <Text style={styles.longDescription}>{dummyCard.longDescription}</Text>
            ) : (
                <KeyboardAvoidingView
                  style={styles.commentsContentContainer}
                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                  keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
                >
                  <ScrollView contentContainerStyle={styles.commentsList}>
                    {dummyComments.map((comment) => (
                      <View key={comment.id} style={styles.commentItem}>
                        <Image source={comment.userAvatar} style={styles.commentAvatar} />
                        <View style={styles.commentContent}>
                          <View style={styles.commentHeader}>
                            <Text style={styles.commentUserName}>{comment.userName}</Text>
                            <Text style={styles.commentTime}>{comment.time}</Text>
                          </View>
                          <Text style={styles.commentText}>{comment.commentText}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                  <View style={styles.commentInputContainer}>
                    <TextInput
                      style={styles.commentTextInput}
                      placeholder={getLocalizedText('写评论...', 'Write a comment...')}
                      placeholderTextColor="#B0B0B0"
                      value={commentInput}
                      onChangeText={setCommentInput}
                    />
                    <TouchableOpacity style={styles.heartIconContainer}>
                      <Text style={styles.heartIcon}>♡</Text>
                    </TouchableOpacity>
                  </View>
                </KeyboardAvoidingView>
            )}
          </View>
        </ImageBackground>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    fontSize: 24,
    color: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRightPlaceholder: {
    width: 44,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cardImage: {
    width: '92%',
    height: 250, // Increased height for better visibility
    resizeMode: 'cover',
    left: 18,
  },
  infoPanelBackground: {
    width: '110%',
    minHeight: 200,
    padding: 40,
    top: -40, // Adjusted for more overlap based on image
    borderRadius: 20,
  },
  infoPanelContent: {
    backgroundColor: 'transparent',
  },
  titleLikeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5, // Keep this reduced margin
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeIcon: {
    fontSize: 20,
    color: '#6A5ACD', // Set to purple/blue as per the image
    marginRight: 5,
  },
  likeCount: {
    fontSize: 16,
    color: 'white',
  },
  shortDescription: {
    fontSize: 16,
    color: 'white',
    marginBottom: 5, // Keep this reduced margin
  },
  metaInfoContainer: {
    marginBottom: 10, // Maintain a small gap for the meta info block
    color: 'black',
  },
  metaInfoLine: {
    fontSize: 14,
    color: 'black',
    marginBottom: 2, // Small margin between lines
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6A5ACD',
    borderRadius: 25,
    paddingVertical: 12,
    width: '90%',
    alignSelf: 'center',
    marginTop: 10,
    justifyContent: 'center',
    position: 'relative',
    left: -22,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  downloadRobotIcon: {
    width: 100,
    height: 100,
    position: 'absolute',
    right: -25,
    top: -35,
    zIndex: 1,
    resizeMode: 'cover',
  },
  tabsContainerBackground: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 20,
    top: -30,
    overflow: 'hidden',
    height: 50, // Explicit height to prevent stretching
  },
  tabsContainerInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 0,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#FFD700',
  },
  tabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  activeTabText: {
    color: '#FFD700',
  },
  tabContentBackground: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 10,
    marginTop: -15,
    overflow: 'hidden',
  },
  tabContentInner: {
    padding: 20,
    backgroundColor: 'transparent',
  },
  longDescription: {
    fontSize: 16,
    color: '#B0B0B0',
    lineHeight: 24,
  },
  commentsPlaceholder: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  commentsSectionBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
    marginHorizontal: 20,
    borderRadius: 10,
    marginTop: -15,
    overflow: 'hidden',
    left: -40,
  },
  commentsContentContainer: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  commentsList: {
    paddingHorizontal: 10,
    paddingBottom: 60,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'gray',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  commentUserName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  commentTime: {
    color: '#B0B0B0',
    fontSize: 12,
  },
  commentText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: 'black',
    fontSize: 16,
    marginRight: 10,
  },
  heartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  heartIcon: {
    fontSize: 24,
    color: '#FFD700',
  },
});

export default StyleCardDetailScreen; 