import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';

const storage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await localforage.getItem(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

export type SessionState = 'idle' | 'running' | 'paused' | 'delayed' | 'finished';
export type DelayLevel = 30 | 120 | 300; // seconds

export interface Session {
  id: string;
  taskId: string;
  plannedDuration: number;
  actualDuration: number;
  startTime: number | null;
  endTime: number | null;
  state: SessionState;
  chainId: string;
  interruptCount: number;
  qualityRating?: number; // 1-5 rating added
}

export interface UrgeEvent {
  id: string;
  sessionId: string;
  timestamp: number;
  intensity: number; // 1-10
  delayLevel: DelayLevel;
  outcome: 'overcome' | 'yielded';
}

export interface Chain {
  id: string;
  name: string;
  currentLength: number;
  maxLength: number;
}

interface FocusState {
  // Current Session
  currentSession: Session | null;
  
  // History
  historySessions: Session[];
  historyUrges: UrgeEvent[];
  chains: Chain[];
  
  // Actions
  startSession: (taskId: string, plannedDuration: number, chainId: string) => void;
  pauseSession: (actualDuration: number) => void;
  resumeSession: () => void;
  finishSession: (actualDuration: number, endType: 'success' | 'degrade' | 'fail', qualityRating?: number) => void;
  abortSession: () => void;
  
  // Delay Protocol Actions
  recordUrge: (intensity: number, delayLevel: DelayLevel, outcome: 'overcome' | 'yielded') => void;
  
  // Chain Actions
  createChain: (name: string) => void;
  deleteChain: (id: string) => void;
  updateChainName: (id: string, name: string) => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      historySessions: [],
      historyUrges: [],
      chains: [{ id: 'default', name: '日常专注', currentLength: 0, maxLength: 0 }],

      startSession: (taskId, plannedDuration, chainId) => {
        set({
          currentSession: {
            id: crypto.randomUUID(),
            taskId,
            plannedDuration,
            actualDuration: 0,
            startTime: Date.now(),
            endTime: null,
            state: 'running',
            chainId,
            interruptCount: 0,
          },
        });
      },

      pauseSession: (actualDuration) => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: { ...state.currentSession, state: 'paused', actualDuration },
          };
        });
      },

      resumeSession: () => {
        set((state) => {
          if (!state.currentSession) return state;
          return {
            currentSession: { ...state.currentSession, state: 'running' },
          };
        });
      },

      finishSession: (actualDuration, endType, qualityRating) => {
        set((state) => {
          if (!state.currentSession) return state;
          const session = {
            ...state.currentSession,
            actualDuration,
            endTime: Date.now(),
            state: 'finished' as SessionState,
            qualityRating,
          };
          
          // Update Chain
          const updatedChains = state.chains.map(chain => {
            if (chain.id === session.chainId) {
              if (endType === 'success' || endType === 'degrade') {
                const newLen = chain.currentLength + 1;
                return {
                  ...chain,
                  currentLength: newLen,
                  maxLength: Math.max(chain.maxLength, newLen)
                };
              } else {
                return { ...chain, currentLength: 0 };
              }
            }
            return chain;
          });

          return {
            currentSession: null,
            historySessions: [...state.historySessions, session],
            chains: updatedChains
          };
        });
      },

      abortSession: () => {
        set((state) => {
          if (!state.currentSession) return state;
          const session = {
            ...state.currentSession,
            endTime: Date.now(),
            state: 'finished' as SessionState,
          };
          
          // Chain breaks on abort
          const updatedChains = state.chains.map(chain => {
            if (chain.id === session.chainId) {
              return { ...chain, currentLength: 0 };
            }
            return chain;
          });

          return {
            currentSession: null,
            historySessions: [...state.historySessions, session],
            chains: updatedChains
          };
        });
      },

      recordUrge: (intensity, delayLevel, outcome) => {
        set((state) => {
          if (!state.currentSession) return state;
          
          const urge: UrgeEvent = {
            id: crypto.randomUUID(),
            sessionId: state.currentSession.id,
            timestamp: Date.now(),
            intensity,
            delayLevel,
            outcome
          };

          return {
            historyUrges: [...state.historyUrges, urge],
            currentSession: {
              ...state.currentSession,
              interruptCount: state.currentSession.interruptCount + 1,
            }
          };
        });
      },

      createChain: (name) => {
        set((state) => ({
          chains: [...state.chains, { id: crypto.randomUUID(), name, currentLength: 0, maxLength: 0 }]
        }));
      },

      deleteChain: (id) => {
        set((state) => ({
          chains: state.chains.filter(c => c.id !== id)
        }));
      },

      updateChainName: (id, name) => {
        set((state) => ({
          chains: state.chains.map(c => c.id === id ? { ...c, name } : c)
        }));
      }
    }),
    {
      name: 'focus-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
