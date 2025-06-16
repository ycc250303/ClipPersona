import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useLanguage } from './context/LanguageContext'; // 导入 useLanguage
import { useUser } from './context/UserContext'; // 导入 useUser
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker'; // 导入图片选择器和类型

const SettingsScreen: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制模态框可见性
  const [isEditingNickname, setIsEditingNickname] = useState(false); // 编辑模式状态
  const [tempNickname, setTempNickname] = useState(''); // 临时昵称，用于编辑输入框

  const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false); // 新增：语言选择模态框可见性
  const { currentLanguage, setLanguage } = useLanguage(); // 使用 useLanguage hook
  const { nickname, avatarUri, setNickname, setAvatarUri } = useUser(); // 使用 useUser hook

  const handleHelpPress = () => {
    Alert.alert('帮助', '这是一个视频编辑应用。您可以在主页查看草稿，在剪辑页面选择媒体进行编辑，并在设置页面管理您的账户和偏好设置。');
    // 实际应用中可以打开一个网页链接
    // Linking.openURL('https://your-help-url.com');
  };

  const handleAvatarPress = () => {
    setIsModalVisible(true); // 点击头像显示模态框
  };

  const handleCloseModal = () => {
    setIsModalVisible(false); // 关闭模态框
  };

  const handleChangeAvatar = async () => {
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      quality: 1,
      selectionLimit: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('用户取消了图片选择');
      } else if (response.errorCode) {
        console.log('图片选择错误:', response.errorCode, response.errorMessage);
        Alert.alert('错误', `图片选择失败: ${response.errorMessage}`);
      } else if (response.assets && response.assets.length > 0) {
        const selectedImageUri = response.assets[0].uri;
        if (selectedImageUri) {
          setAvatarUri({ uri: selectedImageUri }); // 更新头像URI到全局状态
          setIsModalVisible(false); // 更换后关闭模态框
          Alert.alert('成功', '头像已更换！');
        }
      }
    });
  };

  const handleEditNickname = () => {
    setTempNickname(nickname === '请输入昵称' ? '' : nickname); // 进入编辑模式时，将当前昵称复制到临时昵称
    setIsEditingNickname(true); // 切换到编辑模式
  };

  const handleSaveNickname = () => {
    if (tempNickname.trim() === '') {
      setNickname('请输入昵称'); // 如果输入为空，设置回默认值
    } else {
      setNickname(tempNickname); // 保存临时昵称到正式昵称（全局状态）
    }
    setIsEditingNickname(false); // 退出编辑模式
  };

  const handleCancelEdit = () => {
    setIsEditingNickname(false); // 退出编辑模式，不保存更改
  };

  const getLocalizedText = (zhText: string, enText: string) => {
    return currentLanguage === 'zh' ? zhText : enText;
  };

  return (
  <ImageBackground
      source={require('../Images/background.png')} // 大背景图
      style={styles.container}
    resizeMode="cover"
  >
    <ImageBackground
      source={require('../Images/SettingScreen/decoration1.png')} // 装饰1
      style={styles.decoration1}
      resizeMode="cover"
    />
    <ImageBackground
      source={require('../Images/SettingScreen/decoration2.png')} // 装饰2
      style={styles.decoration2}
      resizeMode="cover"
    />
    <ImageBackground
      source={require('../Images/SettingScreen/decoration3.png')} // 装饰3
      style={styles.decoration3}
      resizeMode="cover"
    />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 账户管理 */}
        <ImageBackground
          source={require('../Images/SettingScreen/Info.png')} // 账户管理背景图
          style={styles.accountManagementBackground}
          resizeMode="stretch"
        >
          <View style={styles.accountManagementContent}>
            <Text style={styles.accountManagementText}>{getLocalizedText('账户管理', 'Account Management')}</Text>
            {isEditingNickname ? (
              <TextInput
                style={styles.nicknameInput}
                value={tempNickname === '请输入昵称' ? getLocalizedText('请输入昵称', 'Enter nickname') : tempNickname} // 兼容初始值
                onChangeText={setTempNickname}
                autoFocus
                onBlur={handleSaveNickname} // 当输入框失去焦点时保存
                placeholder={getLocalizedText('请输入昵称', 'Enter nickname')}
              />
            ) : (
              <Text style={styles.nickname}>{nickname === '请输入昵称' ? getLocalizedText('请输入昵称', 'Enter nickname') : nickname}</Text>
            )}
            <Image
              source={require('../Images/SettingScreen/point.png')}
              style={styles.pointIcon}
              resizeMode="contain"
            />
            <TouchableOpacity onPress={handleAvatarPress}>
              <Image
                source={avatarUri} // 使用全局状态中的头像URI
                style={styles.user}
                resizeMode="contain"
              />
            </TouchableOpacity>
            {isEditingNickname ? (
              <View style={styles.nicknameEditButtons}>
                <TouchableOpacity onPress={handleSaveNickname} style={styles.saveButton}>
                  <Text style={styles.buttonText}>保存</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                  <Text style={styles.buttonText}>取消</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleEditNickname}>
                <Image
                  source={require('../Images/SettingScreen/edit.png')} // 编辑
                  style={styles.edit}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            <Image
              source={require('../Images/SettingScreen/wallet.png')} // 钱包装饰图
              style={styles.walletIcon}
              resizeMode="contain"
            />
            <Image
              source={require('../Images/SettingScreen/dim.png')} // 钱包模糊
              style={styles.dimIcon}
              resizeMode="contain"
            />
          </View>
        </ImageBackground>

        {/* 其他 */}
        <ImageBackground
          source={require('../Images/SettingScreen/background.png')} // 小框背景图
          style={styles.settingSectionBackground}
          resizeMode="stretch"
        >
          <View style={styles.settingSectionContent}>
            <Text style={styles.sectionTitle}>{getLocalizedText('其他', 'Other Settings')}</Text>
            <TouchableOpacity style={styles.settingItem} onPress={() => setIsLanguageModalVisible(true)}>
              <Text style={styles.settingLabel}>{getLocalizedText('语言', 'Language')}</Text>
              <Text style={styles.settingValue}>{getLocalizedText('中文', 'English')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem} onPress={handleHelpPress}>
              <Text style={styles.settingLabel}>{getLocalizedText('帮助', 'Help')}</Text>
              <Text style={styles.helpLink}>{getLocalizedText('点击查看', 'Click to view')}</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>


      </ScrollView>

      {/* Avatar Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Image source={avatarUri} style={styles.fullScreenAvatar} resizeMode="contain" />
            <TouchableOpacity style={styles.modalButton} onPress={handleChangeAvatar}>
              <Text style={styles.modalButtonText}>更换头像</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.closeButton]} onPress={handleCloseModal}>
              <Text style={styles.modalButtonText}>关闭</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isLanguageModalVisible}
        onRequestClose={() => setIsLanguageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getLocalizedText('选择语言', 'Select Language')}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setLanguage('zh');
                setIsLanguageModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>中文</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setLanguage('en');
                setIsLanguageModalVisible(false);
              }}
            >
              <Text style={styles.modalButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.closeButton]} onPress={() => setIsLanguageModalVisible(false)}>
              <Text style={styles.modalButtonText}>{getLocalizedText('取消', 'Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  </ImageBackground>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decoration1: {
      width: 200, // 增大图标尺寸
      height: 200,
      position: 'absolute',
      top: 390,
      right: 55,
    },
  decoration2: {
      width: 100, // 增大图标尺寸
      height: 100,
      position: 'absolute',
      top: 640,
      right: 150,
    },
  decoration3: {
      width: 80, // 增大图标尺寸
      height: 80,
      position: 'absolute',
      top: 770,
      left: 120,
    },
  scrollContent: {
    padding: 20,
    paddingTop: 100, // 增加顶部内边距
    alignItems: 'center',
  },
  accountManagementBackground: {
    width: '110%',
    height: 250, // 增加高度
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30, // 增加底部外边距
    paddingHorizontal: 10,
  },
  accountManagementContent: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  accountManagementText: {
    fontSize: 22, // 稍微增大字体
    fontWeight: 'bold',
    color: '#000',
    position: 'absolute',
    top: 40,
    left: 30,
  },
  nickname: {
    fontSize: 20, // 稍微增大字体
    fontWeight: 'bold',
    color: '#000',
    position: 'absolute',
    top: 106,
    left: 120,
  },
  nicknameInput: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    position: 'absolute',
    top: 106,
    left: 120,
    width: 150,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 0,
  },
  user: {
      width: 80, // 增大图标尺寸
      height: 70,
      position: 'absolute',
      top: 90,
      left: 30,
    },
  edit: {
      width: 20, // 增大图标尺寸
      height: 50,
      position: 'absolute',
      top: 122,
      left: 122,
    },
  nicknameEditButtons: {
    flexDirection: 'row',
    position: 'absolute',
    top: 95,
    left: 230,
  },
  saveButton: {
    backgroundColor: 'green',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: 'gray',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
  },
  dimIcon: {
      width: 80, // 增大图标尺寸
      height: 80,
      position: 'absolute',
      bottom: 60,
      right: 10,
    },
  walletIcon: {
    width: 80, // 增大图标尺寸
    height: 80,
    position: 'absolute',
    bottom: 60,
    right: 10,
  },
  pointIcon: {
    width: 300,
    height: 200,
    position: 'absolute',
    bottom: 32,
    right: 50,
  },
  settingSectionBackground: {
    width: '103%',
    marginBottom: 30, // 增加底部外边距
    padding: 25, // 增加内边距
    borderRadius: 15, // 稍微增大圆角
    left: 20,
    opacity: 0.8, // 设置图片透明度
  },
  settingSectionContent: {
    width: '90%',

  },
  sectionTitle: {
    fontSize: 20, // 稍微增大字体
    fontWeight: 'bold',
    marginBottom: 15, // 增加底部外边距
    color: '#FFF',
    left: -6,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15, // 增加底部外边距
    paddingVertical: 12, // 增加垂直内边距
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
    right: 8,
  },
  settingLabel: {
    fontSize: 18, // 稍微增大字体
    color: '#555',
  },
  settingValue: {
    fontSize: 18, // 稍微增大字体
    color: '#FFF',
  },
  helpLink: {
    color: '#007AFF',
    fontSize: 18, // 稍微增大字体
  },
  modalTitle: { // 新增：模态框标题样式
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  fullScreenAvatar: {
    width: 300,
    height: 300,
    borderRadius: 150,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
  },
});

export default SettingsScreen;
