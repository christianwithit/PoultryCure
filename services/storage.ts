import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { EncryptedCredentials, SessionData, User } from '../types/types';
import { EncryptionUtils } from '../utils/encryption';

export class StorageManager {
  private static readonly STORAGE_KEYS = {
    USER_DATA: 'user_data',
    CREDENTIALS: 'user_credentials',
    SESSION: 'user_session',
    ENCRYPTION_KEY: 'encryption_key',
  };

  /**
   * Gets or creates an encryption key for data protection
   */
  private async getEncryptionKey(): Promise<string> {
    try {
      let key = await SecureStore.getItemAsync(StorageManager.STORAGE_KEYS.ENCRYPTION_KEY);
      if (!key) {
        key = EncryptionUtils.generateKey();
        await SecureStore.setItemAsync(StorageManager.STORAGE_KEYS.ENCRYPTION_KEY, key);
      }
      return key;
    } catch (error) {
      throw new Error(`Failed to get encryption key: ${error}`);
    }
  }

  /**
   * Stores user data securely with encryption
   */
  async storeUser(user: User): Promise<void> {
    try {
      const key = await this.getEncryptionKey();
      const userData = JSON.stringify({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      });
      const encryptedData = await EncryptionUtils.encrypt(userData, key);
      await AsyncStorage.setItem(StorageManager.STORAGE_KEYS.USER_DATA, encryptedData);
    } catch (error) {
      throw new Error(`Failed to store user data: ${error}`);
    }
  }

  /**
   * Retrieves user data and decrypts it
   */
  async getUser(): Promise<User | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(StorageManager.STORAGE_KEYS.USER_DATA);
      if (!encryptedData) {
        return null;
      }

      const key = await this.getEncryptionKey();
      const decryptedData = await EncryptionUtils.decrypt(encryptedData, key);
      const userData = JSON.parse(decryptedData);
      
      return {
        ...userData,
        createdAt: new Date(userData.createdAt),
        updatedAt: new Date(userData.updatedAt),
      };
    } catch (error) {
      // If decryption fails, return null (data might be corrupted)
      console.warn('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Stores encrypted credentials in secure storage
   */
  async storeCredentials(credentials: EncryptedCredentials): Promise<void> {
    try {
      const credentialsData = JSON.stringify(credentials);
      await SecureStore.setItemAsync(StorageManager.STORAGE_KEYS.CREDENTIALS, credentialsData);
    } catch (error) {
      throw new Error(`Failed to store credentials: ${error}`);
    }
  }

  /**
   * Retrieves encrypted credentials from secure storage
   */
  async getCredentials(): Promise<EncryptedCredentials | null> {
    try {
      const credentialsData = await SecureStore.getItemAsync(StorageManager.STORAGE_KEYS.CREDENTIALS);
      if (!credentialsData) {
        return null;
      }
      return JSON.parse(credentialsData);
    } catch (error) {
      console.warn('Failed to retrieve credentials:', error);
      return null;
    }
  }

  /**
   * Stores session data with encryption
   */
  async storeSession(sessionData: SessionData): Promise<void> {
    try {
      const key = await this.getEncryptionKey();
      const sessionJson = JSON.stringify({
        ...sessionData,
        expiresAt: sessionData.expiresAt.toISOString(),
        createdAt: sessionData.createdAt.toISOString(),
      });
      const encryptedData = await EncryptionUtils.encrypt(sessionJson, key);
      await AsyncStorage.setItem(StorageManager.STORAGE_KEYS.SESSION, encryptedData);
    } catch (error) {
      throw new Error(`Failed to store session data: ${error}`);
    }
  }

  /**
   * Retrieves and decrypts session data
   */
  async getSession(): Promise<SessionData | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(StorageManager.STORAGE_KEYS.SESSION);
      if (!encryptedData) {
        return null;
      }

      const key = await this.getEncryptionKey();
      const decryptedData = await EncryptionUtils.decrypt(encryptedData, key);
      const sessionData = JSON.parse(decryptedData);
      
      return {
        ...sessionData,
        expiresAt: new Date(sessionData.expiresAt),
        createdAt: new Date(sessionData.createdAt),
      };
    } catch (error) {
      console.warn('Failed to retrieve session data:', error);
      return null;
    }
  }

  /**
   * Clears all user-related data from storage
   */
  async clearUserData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(StorageManager.STORAGE_KEYS.USER_DATA),
        AsyncStorage.removeItem(StorageManager.STORAGE_KEYS.SESSION),
        SecureStore.deleteItemAsync(StorageManager.STORAGE_KEYS.CREDENTIALS),
      ]);
    } catch (error) {
      throw new Error(`Failed to clear user data: ${error}`);
    }
  }

  /**
   * Checks if session data exists and is valid
   */
  async hasValidSession(): Promise<boolean> {
    try {
      const session = await this.getSession();
      if (!session) {
        return false;
      }
      
      // Check if session has expired
      return session.expiresAt > new Date();
    } catch (error) {
      return false;
    }
  }

  /**
   * Updates user data by merging with existing data
   */
  async updateUser(updates: Partial<User>): Promise<void> {
    try {
      const existingUser = await this.getUser();
      if (!existingUser) {
        throw new Error('No user data found to update');
      }

      const updatedUser: User = {
        ...existingUser,
        ...updates,
        updatedAt: new Date(),
      };

      await this.storeUser(updatedUser);
    } catch (error) {
      throw new Error(`Failed to update user data: ${error}`);
    }
  }
}

export const storageManager = new StorageManager();