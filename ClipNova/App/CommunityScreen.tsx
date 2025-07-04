import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useLanguage } from './context/LanguageContext'; // Assuming context is available

const { width } = Dimensions.get('window');

const CommunityScreen: React.FC = ({ navigation }: any) => {
  const { currentLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部'); // Default to '全部'

  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
  };

  const categories = [
    { zh: '全部', en: 'All' },
    { zh: '搞笑', en: 'Funny' },
    { zh: '抒情', en: 'Lyrical' },
    { zh: '毒舌', en: 'Sarcastic' },
    { zh: '理性', en: 'Rational' },
  ];

  const dummyCards = [
    {
      id: '1',
      title: getLocalizedText('搞笑弹幕', 'Funny Bullet Comments'),
      author: getLocalizedText('张三', 'Zhang San'),
      downloads: '1.2k',
      description: getLocalizedText('一个充满网络梗的幽默风格，适合短视频爆笑场景。', 'A humorous style full of internet memes, suitable for short video hilarious scenes.'),
      image: require('../Images/Community/show.png'), // Placeholder image
    },
    {
      id: '2',
      title: getLocalizedText('搞笑弹幕', 'Funny Bullet Comments'),
      author: getLocalizedText('张三', 'Zhang San'),
      downloads: '1.2k',
      description: getLocalizedText('一个充满网络梗的幽默风格，适合短视频爆笑场景。', 'A humorous style full of internet memes, suitable for short video hilarious scenes.'),
      image: require('../Images/Community/show.png'), // Placeholder image
    },
    // Add more dummy data as needed
  ];

  return (
    <ImageBackground
      source={require('../Images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{getLocalizedText('社区', 'Community')}</Text>
        <View style={styles.headerRightPlaceholder} /> {/* Placeholder for right side alignment */}
      </View>

      <View style={styles.searchSortContainer}>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder={getLocalizedText('搜索风格卡...', 'Search Style Card...')}
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchIconContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>{getLocalizedText('按热度排序', 'Sort by Popularity')}</Text>
          <Text style={styles.sortDropdownIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal contentContainerStyle={styles.categoryTabsContainer} showsHorizontalScrollIndicator={false}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.zh}
            style={[
              styles.categoryTab,
              selectedCategory === category.zh && styles.selectedCategoryTab,
            ]}
            onPress={() => setSelectedCategory(category.zh)}
          >
            <Text style={[
              styles.categoryTabText,
              selectedCategory === category.zh && styles.selectedCategoryTabText,
            ]}>
              {getLocalizedText(category.zh, category.en)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        {dummyCards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.card}
            onPress={() => navigation.navigate('StyleCardDetail', { card: card })}
          >
            <Image source={card.image} style={styles.cardImage} resizeMode="cover" />
            <ImageBackground
              source={require('../Images/Community/text_background.png')}
              style={styles.cardContentBackground}
              resizeMode="stretch"
            >
              <View style={styles.cardTextContent}>
                <Text style={styles.cardTitle}>{card.title}</Text>
                <Text style={styles.cardMeta}>
                  {getLocalizedText('作者：', 'Author: ')}{card.author}  {getLocalizedText('下载：', 'Downloads: ')}{card.downloads}
                </Text>
                <Text style={styles.cardDescription}>{card.description}</Text>
                <TouchableOpacity style={styles.downloadButton}>
                  <Text style={styles.downloadButtonText}>{getLocalizedText('下载', 'Download')}</Text>
                  <Image source={require('../Images/Community/download.png')} style={styles.downloadIcon} />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
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
    paddingTop: 60, // Adjust for status bar
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    left: 180,
    top: 10,
  },
  headerRightPlaceholder: {
    width: 44, // To balance the back button
  },
  searchSortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F', // Deep dark grey
    borderRadius: 25,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
    height: 50,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  searchIconContainer: {
    paddingLeft: 10,
  },
  searchIcon: {
    fontSize: 20,
    color: '#999999', // Lighter grey for search icon
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F', // Deep dark grey, consistent with searchBox
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sortButtonText: {
    color: 'white',
    fontSize: 16,
    marginRight: 5,
  },
  sortDropdownIcon: {
    color: 'white',
    fontSize: 12,
  },
  categoryTabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryTab: {
    backgroundColor: '#3A3A3A', // Dark grey for unselected tabs
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  selectedCategoryTab: {
    backgroundColor: '#FFD700', // Yellow for selected tab
  },
  categoryTabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectedCategoryTabText: {
    color: 'black', // Black text for selected tab
    fontSize: 14,
  },
  cardsContainer: {
    //paddingHorizontal: 0,
  },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 15,
    overflow: 'hidden',
    width: width - 40,
    alignSelf: 'center',
  },
  cardImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    marginBottom: -5, // Negative margin to make the text background overlap slightly
  },
  cardContentBackground: {
    padding: 25,
    width: '108%',
    minHeight: 150,
    justifyContent: 'center',
    paddingTop: 15, // Add top padding to create space for overlapping
    top: -25, // Move up to overlap with the image
    left: -7,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  cardTextContent: {
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000', // White color for title
    marginBottom: 5,
  },
  cardMeta: {
    fontSize: 14,
    color: '#0000000', // Lighter grey for meta info
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#000000', // Slightly darker grey for description
    marginBottom: 15,
    lineHeight: 20, // Add line height for readability
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignSelf: 'flex-start',
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 8,
  },
  downloadIcon: {
    width: 18,
    height: 18,
    tintColor: 'white',
  },
});

export default CommunityScreen; 