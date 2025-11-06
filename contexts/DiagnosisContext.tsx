// contexts/DiagnosisContext.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { DiagnosisResult } from '../types/types';

interface DiagnosisContextType {
  history: DiagnosisResult[];
  addDiagnosis: (result: DiagnosisResult) => Promise<void>;
  clearHistory: () => Promise<void>;
  deleteDiagnosis: (id: string) => Promise<void>;
  isLoading: boolean;
}

const DiagnosisContext = createContext<DiagnosisContextType | undefined>(undefined);

const STORAGE_KEY = '@poultrycure_history';

export const DiagnosisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<DiagnosisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHistory = async (newHistory: DiagnosisResult[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const addDiagnosis = async (result: DiagnosisResult) => {
    try {
      const newHistory = [result, ...history];
      setHistory(newHistory);
      await saveHistory(newHistory);
      
      // Also save as last diagnosis for quick access
      await AsyncStorage.setItem('lastDiagnosis', JSON.stringify(result));
    } catch (error) {
      console.error('Failed to add diagnosis:', error);
      throw error;
    }
  };

  const clearHistory = async () => {
    try {
      setHistory([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  };

  const deleteDiagnosis = async (id: string) => {
    try {
      const newHistory = history.filter(item => item.id !== id);
      setHistory(newHistory);
      await saveHistory(newHistory);
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
        isLoading,
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