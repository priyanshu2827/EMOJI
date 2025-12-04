'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ScanResult } from './types';

type LogStore = {
  logs: ScanResult[];
  addLog: (log: ScanResult) => void;
  clearLogs: () => void;
  updateLog: (logId: string, updates: Partial<ScanResult>) => void;
};

export const useLogStore = create<LogStore>()(
  persist(
    (set, get) => ({
      logs: [],
      addLog: (log) => set((state) => ({ logs: [log, ...state.logs] })),
      clearLogs: () => set({ logs: [] }),
      updateLog: (logId, updates) =>
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === logId ? { ...log, ...updates } : log
          ),
        })),
    }),
    {
      name: 'stegoshield-logs',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
