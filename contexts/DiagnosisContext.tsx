// contexts/DiagnosisContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { DiagnosisResult } from '../types/types';
import { useAuth } from './AuthContext';
import * as diagnosisService from '../services/supabase-diagnoses';
import NetInfo from '@react-native-community/netinfo';

interface DiagnosisContextType {
  history: DiagnosisResult[];
  addDiagnosis: (result: DiagnosisResult) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteDiagnosis: (id: string) => Promise<void>;
  refreshHistory: () => Promise<void>;
  isLoading: boolean;
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncedAt: Date | null;
}

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(undefined);

const STORAGE_KEY = '@poultrycure_history';
const PENDING_QUEUE_KEY = '@poultrycure_pending_queue';
const LAST_SYNC_KEY = '@poultrycure_last_sync';

interface PendingOperation {
  id: string;
  type: 'add' | 'delete' | 'clear';
  data?: DiagnosisResult;
  timestamp: string;
}

export const DiagnosisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<DiagnosisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isOnline) {
      syncPendingOperations();
    }
  }, [user, isOnline]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);

      if (isOnline && user) {
        const remoteDiagnoses = await diagnosisService.getDiagnoses();
        setHistory(remoteDiagnoses);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remoteDiagnoses));
        
        const now = new Date();
        setLastSyncedAt(now);
        await AsyncStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      } else {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setHistory(parsed);
        }

        const lastSync = await AsyncStorage.getItem(LAST_SYNC_KEY);
        if (lastSync) {
          setLastSyncedAt(new Date(lastSync));
        }
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHistory = async () => {
    if (!user) return;
    await loadHistory();
  };

  const saveToLocalStorage = async (newHistory: DiagnosisResult[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  };

  const addToPendingQueue = async (operation: PendingOperation) => {
    try {
      const queueStr = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      const queue: PendingOperation[] = queueStr ? JSON.parse(queueStr) : [];
      queue.push(operation);
      await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to pending queue:', error);
    }
  };

  const syncPendingOperations = async () => {
    if (!user || !isOnline || isSyncing) return;

    try {
      setIsSyncing(true);
      const queueStr = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      if (!queueStr) return;

      const queue: PendingOperation[] = JSON.parse(queueStr);
      if (queue.length === 0) return;

      for (const operation of queue) {
        try {
          if (operation.type === 'add' && operation.data) {
            await diagnosisService.saveDiagnosis(operation.data);
          } else if (operation.type === 'delete') {
            await diagnosisService.deleteDiagnosis(operation.id);
          } else if (operation.type === 'clear') {
            await diagnosisService.clearAllDiagnoses();
          }
        } catch (error) {
          console.error('Failed to sync operation:', operation, error);
        }
      }

      await AsyncStorage.removeItem(PENDING_QUEUE_KEY);
      await loadHistory();
    } catch (error) {
      console.error('Failed to sync pending operations:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const addDiagnosis = async (result: DiagnosisResult) => {
    try {
      const newHistory = [result, ...history];
      setHistory(newHistory);
      await saveToLocalStorage(newHistory);

      await AsyncStorage.setItem('lastDiagnosis', JSON.stringify(result));

      if (isOnline && user) {
        try {
          const savedDiagnosis = await diagnosisService.saveDiagnosis(result);
          const updatedHistory = [savedDiagnosis, ...history];
          setHistory(updatedHistory);
          await saveToLocalStorage(updatedHistory);
          
          const now = new Date();
          setLastSyncedAt(now);
          await AsyncStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        } catch (error) {
          console.error('Failed to save to Supabase, queuing for later:', error);
          await addToPendingQueue({
            id: result.id,
            type: 'add',
            data: result,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await addToPendingQueue({
          id: result.id,
          type: 'add',
          data: result,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to add diagnosis:', error);
      throw error;
    }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(STORAGE_KEY);

      if (isOnline && user) {
        try {
          await diagnosisService.clearAllDiagnoses();
          
          const now = new Date();
          setLastSyncedAt(now);
          await AsyncStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        } catch (error) {
          console.error('Failed to clear from Supabase, queuing for later:', error);
          await addToPendingQueue({
            id: 'clear-all',
            type: 'clear',
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await addToPendingQueue({
          id: 'clear-all',
          type: 'clear',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  };

  const deleteDiagnosis = async (id: string) => {
    try {
      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);
      await saveToLocalStorage(newHistory);

      if (isOnline && user) {
        try {
          await diagnosisService.deleteDiagnosis(id);
          
          const now = new Date();
          setLastSyncedAt(now);
          await AsyncStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        } catch (error) {
          console.error('Failed to delete from Supabase, queuing for later:', error);
          await addToPendingQueue({
            id,
            type: 'delete',
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        await addToPendingQueue({
          id,
          type: 'delete',
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to delete diagnosis:', error);
      throw error;
    }
  };

  return (
    <DiagnosisContext.Provider
      value={{
        history,
        addDiagnosis,
        clearHistory,
        deleteDiagnosis,
        refreshHistory,
        isLoading,
        isSyncing,
        isOnline,
        lastSyncedAt,
      }}
    >
      {children}
    </DiagnosisContext.Provider>
  );
};

export const useDiagnosis = () => {
  const context = useContext(DiagnosisContext);
  if (context === undefined) {
    throw new Error('useDiagnosis must be used within a DiagnosisProvider');
  }
  return context;
};