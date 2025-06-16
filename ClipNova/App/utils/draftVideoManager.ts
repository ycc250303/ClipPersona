import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { createThumbnail } from "react-native-create-thumbnail";

const DRAFT_VIDEOS_KEY = '@draft_videos';
const DRAFT_VIDEOS_DIR = `${RNFS.DocumentDirectoryPath}/draft_videos`;

export interface DraftVideo {
  id: string;
  name: string;
  path: string; // 本地文件路径
  thumbnailPath?: string; // 新增：视频缩略图路径
  timestamp: number;
}

// 确保草稿视频目录存在
const ensureDraftsDirectory = async () => {
  const dirExists = await RNFS.exists(DRAFT_VIDEOS_DIR);
  if (!dirExists) {
    await RNFS.mkdir(DRAFT_VIDEOS_DIR);
  }
};

// 保存一个草稿视频
export const saveDraftVideo = async (video: Omit<DraftVideo, 'id' | 'timestamp'>): Promise<DraftVideo | null> => {
  try {
    await ensureDraftsDirectory();

    const id = Date.now().toString();
    const timestamp = Date.now();
    const newFileName = `${id}.mp4`; // 使用ID作为文件名确保唯一性
    const newPath = `${DRAFT_VIDEOS_DIR}/${newFileName}`;

    // 将视频从临时路径移动到草稿目录
    await RNFS.copyFile(video.path.replace('file://', ''), newPath);
    
    let thumbnailPath: string | undefined;
    try {
      const thumbnailUrl = `file://${newPath}`;
      console.log('尝试生成缩略图，视频URL:', thumbnailUrl);
      // 生成缩略图
      const thumbnailResponse = await createThumbnail({
        url: thumbnailUrl,
        timeStamp: 1000, // 获取视频第一秒的帧
        format: 'jpeg',
        //maxWidth: 100, // 适应 itemIconBackground 的尺寸
        //maxHeight: 100, // 适应 itemIconBackground 的尺寸
      });
      thumbnailPath = thumbnailResponse.path;
      console.log('缩略图生成成功，路径:', thumbnailPath);
    } catch (thumbError: any) {
      console.error('生成缩略图失败:', thumbError.message, thumbError.stack);
    }
    
    const draftVideo: DraftVideo = {
      id,
      name: video.name,
      path: `file://${newPath}`, // 存储带file://前缀的路径
      thumbnailPath: thumbnailPath, // 保存缩略图路径
      timestamp,
    };

    const storedVideosJson = await AsyncStorage.getItem(DRAFT_VIDEOS_KEY);
    const storedVideos: DraftVideo[] = storedVideosJson ? JSON.parse(storedVideosJson) : [];

    storedVideos.unshift(draftVideo); // 新保存的放在列表顶部

    await AsyncStorage.setItem(DRAFT_VIDEOS_KEY, JSON.stringify(storedVideos));
    console.log(`草稿视频保存成功: ${draftVideo.path}`);
    return draftVideo;
  } catch (error) {
    console.error('保存草稿视频失败:', error);
    return null;
  }
};

// 加载所有草稿视频
export const loadDraftVideos = async (): Promise<DraftVideo[]> => {
  try {
    const storedVideosJson = await AsyncStorage.getItem(DRAFT_VIDEOS_KEY);
    const storedVideos: DraftVideo[] = storedVideosJson ? JSON.parse(storedVideosJson) : [];
    // 过滤掉可能已不存在的文件（例如用户手动删除）
    const validVideos: DraftVideo[] = [];
    for (const video of storedVideos) {
      if (video.path.startsWith('file://')) {
        const filePath = video.path.replace('file://', '');
        const fileExists = await RNFS.exists(filePath);
        if (fileExists) {
          validVideos.push(video);
        } else {
          console.warn(`草稿视频文件不存在，将从列表中移除: ${video.path}`);
        }
      } else {
        // 对于不带 file:// 前缀的旧路径，也检查一下并移除
        const fileExists = await RNFS.exists(video.path);
        if (fileExists) {
           validVideos.push({ ...video, path: `file://${video.path}` }); // 自动添加前缀
        } else {
          console.warn(`草稿视频文件不存在（旧路径），将从列表中移除: ${video.path}`);
        }
      }
    }
    await AsyncStorage.setItem(DRAFT_VIDEOS_KEY, JSON.stringify(validVideos)); // 更新 AsyncStorage
    return validVideos;
  } catch (error) {
    console.error('加载草稿视频失败:', error);
    return [];
  }
};

// 删除一个草稿视频
export const deleteDraftVideo = async (id: string): Promise<boolean> => {
  try {
    const storedVideosJson = await AsyncStorage.getItem(DRAFT_VIDEOS_KEY);
    let storedVideos: DraftVideo[] = storedVideosJson ? JSON.parse(storedVideosJson) : [];

    const videoToDelete = storedVideos.find(video => video.id === id);

    if (videoToDelete) {
      // 从本地文件系统删除视频文件
      if (videoToDelete.path.startsWith('file://')) {
        const filePath = videoToDelete.path.replace('file://', '');
        const fileExists = await RNFS.exists(filePath);
        if (fileExists) {
          await RNFS.unlink(filePath);
          console.log(`草稿视频文件删除成功: ${filePath}`);
        } else {
          console.warn(`尝试删除不存在的草稿视频文件: ${filePath}`);
        }
      } else {
        // 兼容旧的没有 file:// 前缀的路径
        const fileExists = await RNFS.exists(videoToDelete.path);
        if (fileExists) {
          await RNFS.unlink(videoToDelete.path);
          console.log(`草稿视频文件删除成功 (旧路径): ${videoToDelete.path}`);
        } else {
          console.warn(`尝试删除不存在的草稿视频文件 (旧路径): ${videoToDelete.path}`);
        }
      }
      
      // 同时删除缩略图文件（如果存在）
      if (videoToDelete.thumbnailPath) {
        const thumbFilePath = videoToDelete.thumbnailPath.replace('file://', '');
        const thumbFileExists = await RNFS.exists(thumbFilePath);
        if (thumbFileExists) {
          await RNFS.unlink(thumbFilePath);
          console.log(`草稿视频缩略图文件删除成功: ${thumbFilePath}`);
        } else {
          console.warn(`尝试删除不存在的草稿视频缩略图文件: ${thumbFilePath}`);
        }
      }
      
      // 从 AsyncStorage 删除记录
      storedVideos = storedVideos.filter(video => video.id !== id);
      await AsyncStorage.setItem(DRAFT_VIDEOS_KEY, JSON.stringify(storedVideos));
      console.log(`草稿视频记录删除成功: ID ${id}`);
      return true;
    }
    console.warn(`未找到要删除的草稿视频: ID ${id}`);
    return false;
  } catch (error) {
    console.error('删除草稿视频失败:', error);
    return false;
  }
}; 