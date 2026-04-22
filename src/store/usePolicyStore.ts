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

export interface Policy {
  id: string;
  title: string;
  conditionIf: string;
  actionThen: string;
  reminderTime?: string;
  goalId?: string;
  projectId?: string;
  isTemplate: boolean;
  isActive: boolean;
  createdAt: number;
}

export const TEMPLATE_POLICIES: Policy[] = [
  {
    id: 'tpl-1',
    title: '夜幕降临',
    conditionIf: '晚上 22:30',
    actionThen: '洗漱并进入休息流程，不带手机进卧室',
    reminderTime: '22:30',
    isTemplate: true,
    isActive: false,
    createdAt: Date.now()
  },
  {
    id: 'tpl-2',
    title: '手机不上沙发',
    conditionIf: '走到沙发前',
    actionThen: '把手机放在茶几或远处充电，只看书或看电视',
    isTemplate: true,
    isActive: false,
    createdAt: Date.now()
  },
  {
    id: 'tpl-3',
    title: '早晨仪式',
    conditionIf: '早晨醒来',
    actionThen: '先喝一杯水，不看手机直接去洗漱',
    reminderTime: '07:30',
    isTemplate: true,
    isActive: false,
    createdAt: Date.now()
  }
];

interface PolicyState {
  policies: Policy[];
  addPolicy: (policy: Omit<Policy, 'id' | 'createdAt' | 'isTemplate'>) => void;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;
  deletePolicy: (id: string) => void;
  togglePolicyActive: (id: string) => void;
  adoptTemplate: (templateId: string) => void;
}

export const usePolicyStore = create<PolicyState>()(
  persist(
    (set, get) => ({
      policies: [],
      
      addPolicy: (policyData) => {
        set((state) => ({
          policies: [
            ...state.policies,
            {
              ...policyData,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
              isTemplate: false,
            }
          ]
        }));
      },

      updatePolicy: (id, updates) => {
        set((state) => ({
          policies: state.policies.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        }));
      },

      deletePolicy: (id) => {
        set((state) => ({
          policies: state.policies.filter(p => p.id !== id)
        }));
      },

      togglePolicyActive: (id) => {
        set((state) => ({
          policies: state.policies.map(p => 
            p.id === id ? { ...p, isActive: !p.isActive } : p
          )
        }));
      },

      adoptTemplate: (templateId) => {
        const template = TEMPLATE_POLICIES.find(t => t.id === templateId);
        if (!template) return;
        
        set((state) => ({
          policies: [
            ...state.policies,
            {
              ...template,
              id: crypto.randomUUID(),
              isTemplate: false,
              isActive: true,
              createdAt: Date.now(),
            }
          ]
        }));
      }
    }),
    {
      name: 'policy-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);
