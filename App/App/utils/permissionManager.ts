import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

export const checkStoragePermissions = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
        try {
            if (Platform.Version >= 33) {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                ];

                const results = await Promise.all(
                    permissions.map(permission => PermissionsAndroid.check(permission))
                );

                return results.every(result => result);
            } else {
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                ];

                const results = await Promise.all(
                    permissions.map(permission => PermissionsAndroid.check(permission))
                );

                return results.every(result => result);
            }
        } catch (err) {
            console.warn('检查权限失败:', err);
            return false;
        }
    }
    return true; // iOS默认返回true
};

export const requestStoragePermissions = async () => {
    if (Platform.OS === 'android') {
        try {
            if (Platform.Version >= 33) {
                // Android 13及以上版本需要的权限
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
                    PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                ];

                const results = await PermissionsAndroid.requestMultiple(permissions);

                const allGranted = Object.values(results).every(
                    result => result === PermissionsAndroid.RESULTS.GRANTED
                );

                if (!allGranted) {
                    console.warn('部分权限未获得授权');
                    return false;
                }
                return true;
            } else {
                // Android 13以下版本需要的权限
                const permissions = [
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
                ];

                const results = await PermissionsAndroid.requestMultiple(permissions);

                const allGranted = Object.values(results).every(
                    result => result === PermissionsAndroid.RESULTS.GRANTED
                );

                if (!allGranted) {
                    console.warn('存储权限未获得授权');
                    return false;
                }
                return true;
            }
        } catch (err) {
            console.warn('权限请求失败:', err);
            return false;
        }
    }
    return true; // iOS默认返回true
}; 