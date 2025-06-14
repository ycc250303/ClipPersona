import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
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
      <Image
        source={require('../Images/HomePage/robot.png')}
        style={styles.robotDecoration}
        resizeMode="contain"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.menuButton}>
            <Image source={require('../Images/HomePage/menu.png')} style={styles.menuIcon} />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <ImageBackground
              source={require('../Images/HomePage/new.png')}
              style={styles.newButtonBackground}
              resizeMode="contain"
            >
              <TouchableOpacity style={styles.addButtonOverlay}>
                <Image source={require('../Images/HomePage/add.png')} style={styles.addIconOverlay} />
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </View>

        {/* User Info / Avatar */}
        <View style={styles.userInfoContainer}>
          <Image source={require('../Images/HomePage/user.png')} style={styles.avatar} />
          <Text style={styles.avatarText}>请输入昵称...</Text>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Image source={require('../Images/HomePage/instruct.png')} style={styles.sectionTitleIcon} />
          <Text style={styles.sectionTitle}>我的草稿</Text>
        </View>
        <View style={styles.sectionContainer}>
          <ImageBackground source={require('../Images/HomePage/item_background.png')} style={styles.itemBackground} resizeMode="stretch">
            <View style={styles.itemContent}>
              <ImageBackground source={require('../Images/HomePage/menu_background.png')} style={styles.itemIconBackground} resizeMode="contain">
                <Image source={require('../Images/HomePage/menu.png')} style={styles.itemIcon} />
              </ImageBackground>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemName}>XXX</Text>
                <Text style={styles.itemDate}>2020.5.01.</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton}>
                <Image source={require('../Images/HomePage/trash.png')} style={styles.deleteIcon} /> //垃圾桶
              </TouchableOpacity>
            </View>
          </ImageBackground>
          <ImageBackground source={require('../Images/HomePage/item_background.png')} style={styles.itemBackground} resizeMode="stretch">
            <View style={styles.itemContent}>
              <ImageBackground source={require('../Images/HomePage/menu_background.png')} style={styles.itemIconBackground} resizeMode="contain">
                <Image source={require('../Images/HomePage/menu.png')} style={styles.itemIcon} />
              </ImageBackground>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemName}>XX</Text>
                <Text style={styles.itemDate}>2020.4.12</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton}>
                <Image source={require('../Images/HomePage/trash.png')} style={styles.deleteIcon} />    //垃圾桶
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.sectionTitleContainer}>
          <Image source={require('../Images/HomePage/instruct.png')} style={styles.sectionTitleIcon} />
          <Text style={styles.sectionTitle}>我的收藏</Text>
        </View>
        <View style={styles.sectionContainer}>
          <ImageBackground source={require('../Images/HomePage/item_background.png')} style={styles.itemBackground} resizeMode="stretch">
            <View style={styles.itemContent}>
              <ImageBackground source={require('../Images/HomePage/menu_background.png')} style={styles.itemIconBackground} resizeMode="contain">
                <Image source={require('../Images/HomePage/menu.png')} style={styles.itemIcon} />
              </ImageBackground>
              <View style={styles.itemTextContainer}>
                <Text style={styles.itemName}>XXX</Text>
                <Text style={styles.itemDate}>2020.6.1.</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton}>
                <Image source={require('../Images/HomePage/trash.png')} style={styles.deleteIcon} />        //垃圾桶
              </TouchableOpacity>
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
  decoration: {
      width: 500,
      height: 500,
      position: 'absolute',
      bottom: 30,
      left: -50,
    },
  scrollContent: {
    padding: 20,
    paddingTop: 50,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: 'black', // Adjust color as needed
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
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
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    marginLeft: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
  },
  avatarText: {
    fontSize: 20,
    color: 'white',
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
    marginBottom: 25,
    alignSelf: 'center',
    paddingHorizontal: 30,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  itemIcon: {
    width: 20,
    height: 20,
  },
  itemIconBackground: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
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
  },
  deleteIcon: {
    width: 35,
    height: 35,
    tintColor: 'red',
  },
  robotDecoration: {
    width: 250,
    height: 250,
    position: 'absolute',
    top: 90,
    right: 40,
    zIndex: 1,
  },
});

export default HomeScreen;

