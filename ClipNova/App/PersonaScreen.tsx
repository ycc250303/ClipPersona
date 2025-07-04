import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { useLanguage } from './context/LanguageContext'; // 导入 useLanguage

const { width, height } = Dimensions.get('window');

// 模拟数据
const myPersonas = [
  {
    id: 'p1',
    icon: require('../Images/HomePage/user.png'),
    name: '理性讲师',
    tag: '理性',
    progress: 0.7,
  },
  {
    id: 'p2',
    icon: require('../Images/HomePage/user.png'),
    name: '搞笑弹幕',
    tag: '搞笑',
    progress: 0.9,
  },
];

const styleCards = [
  {
    id: 's1',
    image: require('../Images/HomePage/card1.png'),
    title: '毒蛇型',
  },
  {
    id: 's2',
    image: require('../Images/HomePage/card1.png'),
    title: '理性讲师',
  },
];

const myShareItems = [
  {
    id: 'share1',
    title: '毒蛇型',
    downloads: 300,
    comments: 15,
    isEnabled: true,
  },
];

const PersonaScreen: React.FC = ({ navigation }: any) => {
  const { currentLanguage } = useLanguage();
  const [isSharingEnabled, setIsSharingEnabled] = React.useState(myShareItems[0].isEnabled); // State for the switch

  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
  };

  return (
    <ImageBackground
      source={require('../Images/background.png')} // 使用应用的通用背景图
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>{getLocalizedText('Persona管理', 'Persona Management')}</Text>
          <View style={styles.headerRightPlaceholder} /> {/* For alignment */}
        </View>

        {/* Create Persona Button */}
        <TouchableOpacity style={styles.createPersonaButton}>
          <Text style={styles.createPersonaButtonText}>{getLocalizedText('创建Persona', 'Create Persona')}</Text>
        </TouchableOpacity>

        {/* 我的Persona */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../Images/HomePage/instruct.png')} style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitle}>{getLocalizedText('我的Persona', 'My Persona')}</Text>
          </View>
            <View style={styles.personaListContent}> {/* Inner View for padding */}
              {myPersonas.map(persona => (
                <ImageBackground
                  key={persona.id}
                  source={require('../Images/Community/text_background.png')}
                  style={styles.personaCardBackground}
                  resizeMode="stretch"
                >
                  <View style={styles.personaCardContent}> {/* Inner View for content */}
                    <View style={styles.personaInfo}>
                      <Image source={persona.icon} style={styles.personaIcon} />
                      <View>
                        <Text style={styles.personaName}>{persona.name}</Text>
                        <Text style={styles.personaTag}>{persona.tag}</Text>
                      </View>
                    </View>
                    <View style={styles.progressBarBackground}>
                      <View style={[styles.progressBarFill, { width: `${persona.progress * 100}%` }]} />
                    </View>
                  </View>
                </ImageBackground>
              ))}
            </View>
        </View>

        {/* 风格卡管理 */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../Images/HomePage/instruct.png')} style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitle}>{getLocalizedText('风格卡管理', 'Style Card Management')}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.styleCardsContainer}>
            {styleCards.map(card => (
              <ImageBackground
                key={card.id}
                source={require('../Images/text.png')}
                style={styles.styleCardItemBackground}
                resizeMode="stretch"
              >
                <View style={styles.styleCardItemContent}>
                  <Image source={card.image} style={styles.styleCardImage} resizeMode="cover" />
                  <Text style={styles.styleCardTitle}>{card.title}</Text>
                  <ImageBackground
                    source={require('../Images/HomePage/download_button.png')}
                    style={styles.styleCardDownloadButton}
                    resizeMode="stretch"
                  >
                    <Text style={styles.styleCardDownloadButtonText}>{getLocalizedText('下载', 'Download')}</Text>
                  </ImageBackground>
                </View>
              </ImageBackground>
            ))}
          </ScrollView>
        </View>

        {/* 我的共享 */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../Images/HomePage/instruct.png')} style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitle}>{getLocalizedText('我的共享', 'My Sharing')}</Text>
          </View>
          <ImageBackground
            source={require('../Images/text.png')}
            style={styles.mySharingBackground}
            resizeMode="stretch"
          >
            <View style={styles.mySharingContent}> {/* Inner View for padding */}
              {myShareItems.map(item => (
                <View key={item.id} style={styles.sharingItem}>
                  <View>
                    <Text style={styles.sharingItemTitle}>{item.title}</Text>
                    <Text style={styles.sharingItemStats}>
                      {getLocalizedText('下载:', 'Downloads:')} {item.downloads}  {getLocalizedText('评论:', 'Comments:')} {item.comments}
                    </Text>
                  </View>
                  <Switch
                    trackColor={{ false: "#767577", true: "#81b0ff" }}
                    thumbColor={item.isEnabled ? "#f5dd4b" : "#f4f3f4"}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setIsSharingEnabled}
                    value={isSharingEnabled}
                  />
                </View>
              ))}
            </View>
          </ImageBackground>
        </View>

        {/* 成长轨迹 */}
        <View style={styles.sectionWrapper}>
          <View style={styles.sectionTitleContainer}>
            <Image source={require('../Images/HomePage/instruct.png')} style={styles.sectionTitleIcon} />
            <Text style={styles.sectionTitle}>{getLocalizedText('成长轨迹', 'Growth Trajectory')}</Text>
          </View>
          <ImageBackground
            source={require('../Images/text.png')}
            style={styles.growthTrajectoryBackground}
            resizeMode="stretch"
          >
            <View style={styles.growthTrajectoryContent}> {/* Inner View for padding */}
              {/* Placeholder for the graph */}
              <Text style={styles.growthTrajectoryText}>
                {getLocalizedText('里程碑：完成100次调整', 'Milestone: 100 adjustments completed')}
              </Text>
            </View>
          </ImageBackground>
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
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 80,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
    paddingHorizontal: 0,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
    marginLeft: 40,

  },
  headerRightPlaceholder: {
    width: 44,
  },
  createPersonaButton: {
    backgroundColor: '#6A5ACD',
    borderRadius: 30,
    paddingVertical: 15,
    paddingHorizontal: 150,
    alignSelf: 'center',
    marginBottom: 30,
  },
  createPersonaButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionWrapper: {
    marginBottom: 30,
    width: '100%',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 0,
  },
  sectionTitleIcon: {
    width: 5,
    height: 28,
    marginRight: 8,
    backgroundColor: '#6A5ACD',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  personaListBackground: {
    width: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  personaListContent: {
    flex: 1,
    padding: 15,
    backgroundColor: 'transparent',
  },
  personaCardBackground: {
    width: '106%',
    marginLeft: '-5%',
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  personaCardContent: {
    flex: 1,
    padding: 15,
    left: 10,
    backgroundColor: 'transparent',
  },
  personaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  personaIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  personaName: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
  },
  personaTag: {
    color: 'black',
    fontSize: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
    marginLeft: 20,
    top: 5,
    left: -20,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#D3D3D3',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6A5ACD',
    borderRadius: 4,
  },
  styleCardsContainer: {
    paddingVertical: 10,
  },
  styleCardItemBackground: {
    width: 150,
    height: 200,
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  styleCardItemContent: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingBottom: 10,
  },
  styleCardImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: 5,
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
    alignSelf: 'center',
    marginTop: 5,
  },
  styleCardDownloadButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  mySharingBackground: {
    width: '100%',
    height: 80,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
  },
  mySharingContent: {
    flex: 1,
    padding: 15,
    backgroundColor: 'transparent',
  },
  sharingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sharingItemTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sharingItemStats: {
    color: '#B0B0B0',
    fontSize: 12,
  },
  growthTrajectoryBackground: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
  },
  growthTrajectoryContent: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  growthTrajectoryText: {
    color: '#B0B0B0',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PersonaScreen; 