import * as SecureStore from 'expo-secure-store';

export const saveToken = async (key, token) => {
    try {
        await SecureStore.setItemAsync(key, token);
    } catch (e) {
        console.error("Error saving token", e);
    }
};

export const getToken = async (key) => {
    try {
        const token = await SecureStore.getItemAsync(key);
        return token ? token : "";
    } catch (e) {
        console.error("Error getting token", e);
        return "";
    }
};

export const deleteToken = async (key) => {
    try {
        await SecureStore.deleteItemAsync(key);
    } catch (e) {
        console.error("Error deleting token", e);
    }
};