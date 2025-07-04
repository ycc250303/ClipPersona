import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  PermissionsAndroid,
  Alert,
  GestureResponderEvent,
  Animated,
  Easing,
} from 'react-native';
import { loadDraftVideos, deleteDraftVideo, DraftVideo } from './utils/draftVideoManager'; // 导入草稿视频管理函数和接口
import { useFocusEffect } from '@react-navigation/native'; // 导入 useFocusEffect
import { useLanguage } from './context/LanguageContext'; // 导入 useLanguage
import { useUser } from './context/UserContext'; // 导入 useUser

const { width } = Dimensions.get('window');

// 推荐风格卡片的模拟数据
const recommendedStyleCards = [
  {
    id: 'rec1',
    title: '搞笑弹幕',
    image: require('../Images/HomePage/card1.png'),
  },
  {
    id: 'rec2',
    title: '抒情浪漫',
    image: require('../Images/HomePage/card1.png'), // 假设有更多不同的卡片图片，这里暂用同一个
  },
  {
    id: 'rec3',
    title: '搞笑弹幕',
    image: require('../Images/HomePage/card1.png'),
  },
];

const HomeScreen: React.FC = ({ navigation }: any) => {
  const [draftVideos, setDraftVideos] = useState<DraftVideo[]>([]);
  const { currentLanguage } = useLanguage(); // 获取当前语言
  const { nickname, avatarUri } = useUser(); // 获取用户昵称和头像URI

  // 辅助函数：根据当前语言获取文本
  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
  };

  // 新增：抖动动画值
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: '存储权限',
          message:
            '应用需要您的存储权限才能下载视频。',
          buttonNeutral: '稍后询问',
          buttonNegative: '取消',
          buttonPositive: '确定',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('已授予存储权限');
        return true;
      } else {
        console.log('存储权限被拒绝');
        return false;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // 加载草稿视频的函数
  const fetchDraftVideos = useCallback(async () => {
    console.log('正在加载草稿视频...');
    const loadedVideos = await loadDraftVideos();
    console.log('加载到的草稿视频:', loadedVideos);
    setDraftVideos(loadedVideos);
  }, []);

  // 当屏幕获得焦点时加载草稿视频
  useFocusEffect(
    useCallback(() => {
      fetchDraftVideos();
    }, [fetchDraftVideos])
  );

  return (
    <ImageBackground
      source={require('../Images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
    <ImageBackground
      source={require('../Images/HomePage/decoration.png')} // 装饰
      style={styles.decoration}
      resizeMode="cover"
    />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          {/* 用户头像和昵称 */}
          <View style={styles.userInfoLeft}>
            <View style={styles.avatarWrapperHeader}>
              <Image source={avatarUri} style={styles.avatarImageHeader} resizeMode="cover" />
            </View>
            <Text style={styles.avatarTextHeader}>{nickname}</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{getLocalizedText('主页', 'Home')}</Text>
          </View>
          <View style={styles.headerRight}>
            <ImageBackground
              source={require('../Images/HomePage/new.png')}
              style={styles.newButtonBackground}
              resizeMode="contain"
            >
              <TouchableOpacity
                style={styles.addButtonOverlay}
                onPress={() => navigation.navigate('Projects')}
              >
                <Image source={require('../Images/HomePage/add.png')} style={styles.addIconOverlay} />
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </View>

        {/* 草稿部分的容器 */}
        <View style={styles.draftsSectionWrapper}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../Images/HomePage/instruct.png')} style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitle}>{getLocalizedText('我的草稿', 'My Drafts')}</Text>
          </View>
          {/* 只有当有草稿视频时才显示机器人 */}
          {draftVideos.length > 0 && (
            <Image
              source={require('../Images/HomePage/robot.png')}
              style={styles.robotDecoration}
              resizeMode="contain"
            />
          )}

          <View style={styles.sectionContainer}>
            {/* 动态渲染草稿视频 */}
            {draftVideos.length === 0 ? (
              <Text style={styles.noDraftText}>{getLocalizedText('暂无草稿视频', 'No draft videos yet')}</Text>
            ) : (
              draftVideos.map((video) => (
                <TouchableOpacity
                  key={video.id}
                  style={styles.itemBackground}
                  onPress={() => navigation.navigate('Projects', { screen: 'EditMedia', params: { mediaUri: video.path, isVideo: true } })}
                >
                  <ImageBackground source={require('../Images/HomePage/item_background.png')} style={styles.itemBackgroundInner} resizeMode="stretch">
                    <View style={styles.itemContent}>
                      <ImageBackground source={require('../Images/HomePage/menu_background.png')} style={styles.itemIconBackground} resizeMode="contain">
                        {/* 根据是否有缩略图显示，否则显示默认图标 */}
                        {video.thumbnailPath ? (
                          <Image source={{ uri: video.thumbnailPath }} style={styles.itemThumbnail} resizeMode="cover" />
                        ) : (
                          <Image source={require('../Images/HomePage/menu.png')} style={styles.itemIcon} />
                        )}
                      </ImageBackground>
                      <View style={styles.itemTextContainer}>
                        <Text style={styles.itemName}>{video.name}</Text>
                        <Text style={styles.itemDate}>{new Date(video.timestamp).toLocaleString()}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={(event) => {
                        event.stopPropagation(); // 阻止事件冒泡
                        Alert.alert(
                          getLocalizedText('删除草稿', 'Delete Draft'),
                          getLocalizedText('您确定要删除此草稿视频吗？此操作不可撤销。注意力。注意力。注意力。', 'Are you sure you want to delete this draft video? This action cannot be undone.'),
                          [
                            { text: getLocalizedText('取消', 'Cancel'), style: 'cancel' },
                            {
                              text: getLocalizedText('确定', 'Confirm'),
                              onPress: async () => {
                                await deleteDraftVideo(video.id);
                                fetchDraftVideos(); // 删除后重新加载列表
                              },
                            },
                          ],
                          { cancelable: true }
                        );
                      }}
                    >
                      <Image source={require('../Images/HomePage/trash.png')} style={styles.deleteIcon} />
                    </TouchableOpacity>
                  </ImageBackground>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* 当前Persona */}
        <View style={styles.draftsSectionWrapper}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../Images/HomePage/instruct.png')} style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitle}>{getLocalizedText('当前Persona', 'Current Persona')}</Text>
          </View>
          {/* 根据是否有草稿视频显示内容 */}
          {draftVideos.length === 0 ? (
            <Text style={styles.noDraftText}>{getLocalizedText('当前无Persona', 'No current Persona')}</Text>
          ) : (
            <Image
              source={require('../Images/HomePage/robot.png')}
              style={styles.robotDecoration}
              resizeMode="contain"
            />
          )}
        </View>

        {/* 推荐风格卡 */}
        <View style={styles.draftsSectionWrapper}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../Images/HomePage/instruct.png')} style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitle}>{getLocalizedText('推荐风格卡', 'Recommended Style Card')}</Text>
          </View>
          {/* 推荐风格卡列表 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedCardsContainer}>
            {recommendedStyleCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.styleCard}
                onPress={() => navigation.navigate('StyleCardDetail', { card: card })} // 导航到详情页
              >
                <Image source={card.image} style={styles.styleCardImage} resizeMode="cover" />
                <View style={styles.styleCardContent}>
                  <Text style={styles.styleCardTitle}>{card.title}</Text>
                  <ImageBackground
                    source={require('../Images/HomePage/download_button.png')}
                    style={styles.styleCardDownloadButton}
                    resizeMode="stretch"
                  >
                    <Text style={styles.styleCardDownloadButtonText}>{getLocalizedText('下载', 'Download')}</Text>
                  </ImageBackground>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

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
  decoration: {
      width: 500,
      height: 500,
      position: 'absolute',
      bottom: 30,
      left: -50,
    },
  scrollContent: {
    padding: 20,
    paddingTop: 80,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapperHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    marginRight: 10,
  },
  avatarImageHeader: {
    width: 40,
    height: 40,
  },
  avatarTextHeader: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    left: -15,
    top: -5,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 5,
  },
  plusIcon: {
    width: 20,
    height: 20,
    tintColor: 'black', // Adjust color as needed
  },
  headerRight: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 15,
    padding: 5,
  },
  headerIcon: {
    width: 24,
    height: 24,
    tintColor: 'black', // Adjust color as needed
  },
  newButtonBackground: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  addButtonOverlay: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconOverlay: {
    width: 28,
    height: 28,
    tintColor: 'black', // Adjust color as needed
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 10,
  },
  sectionTitleIcon: {
    width: 5,
    height: 28,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionContainer: {
    marginBottom: 30,
  },
  itemBackground: {
    width: width * 0.9,
    height: 120,
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 30,
    marginBottom: 25, // 添加回marginBottom以保持项目间距
  },
  itemBackgroundInner: { // 添加新的内部样式，因为外层TouchableOpacity也使用了 itemBackground
    width: '125%',
    height: '100%',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: 30,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  itemIcon: {
    width: 35,
    height: 35,
    padding: 10,
    position: 'absolute',
    left: 18,
    zIndex: 10,
  },
  itemIconBackground: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    left:-15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  itemDate: {
    fontSize: 14,
    color: 'gray',
    marginTop: 5,
  },
  deleteButton: {
    padding: 10,
    position: 'absolute', // 确保绝对定位
    right: 0,
    top: (120 - 35) / 2, // 垂直居中，120是 itemBackgroundInner 的高度，35是删除图标的高度
    zIndex: 10, // 确保它在所有其他元素之上可点击
  },
  deleteIcon: {
    width: 35,
    height: 35,
    tintColor: 'red',
  },
  robotDecoration: {
    width: 200, // 调整大小以更好地适应
    height: 200, // 调整大小以更好地适应
    position: 'absolute',
    top: -75, // 根据实际布局调整，使其位于"我的草稿"右上方附近
    right: 0, // 靠右对齐
    zIndex: 1,
  },
  firstItemWithRobotContainer: {
    // 这个样式不再需要，因为它现在由动态渲染处理，且机器人图片移出了这个容器
    // 可以考虑删除或重命名，但目前保留以避免潜在问题
    marginBottom: 30,
    position: 'relative',
    width: '100%',
    height: 120,
    justifyContent: 'center',
  },
  noDraftText: {
    color: 'gray',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  draftsSectionWrapper: {
    position: 'relative',
    width: '100%',
  },
  itemThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  recommendedCardsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  styleCard: {
    width: 150,
    height: 200,
    backgroundColor: '#2c2c2c',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
  },
  styleCardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  styleCardContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  styleCardTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  styleCardDownloadButton: {
    width: '100%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleCardDownloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

