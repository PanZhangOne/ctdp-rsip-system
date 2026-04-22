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

export interface Goal {
  id: string;
  title: string;
  createdAt: number;
}

export interface Project {
  id: string;
  goalId: string;
  title: string;
  createdAt: number;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  createdAt: number;
  archived?: boolean;
}

export interface TaskMeta {
  goalId?: string;
  projectId?: string;
  taskId?: string;
}

interface GoalState {
  goals: Goal[];
  projects: Project[];
  tasks: Task[];
  selected: TaskMeta;

  createGoal: (title: string) => string;
  createProject: (goalId: string, title: string) => string;
  createTask: (projectId: string, title: string) => string;

  updateGoal: (id: string, updates: Partial<Goal>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  deleteGoal: (id: string) => void;
  deleteProject: (id: string) => void;
  deleteTask: (id: string) => void;

  setSelected: (meta: TaskMeta) => void;
  clearSelected: () => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      projects: [],
      tasks: [],
      selected: {},

      createGoal: (title) => {
        const id = crypto.randomUUID();
        set((state) => ({
          goals: [
            ...state.goals,
            { id, title: title.trim(), createdAt: Date.now() }
          ]
        }));
        return id;
      },

      createProject: (goalId, title) => {
        const id = crypto.randomUUID();
        set((state) => ({
          projects: [
            ...state.projects,
            { id, goalId, title: title.trim(), createdAt: Date.now() }
          ]
        }));
        return id;
      },

      createTask: (projectId, title) => {
        const id = crypto.randomUUID();
        set((state) => ({
          tasks: [
            ...state.tasks,
            { id, projectId, title: title.trim(), createdAt: Date.now() }
          ]
        }));
        return id;
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
        }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p)
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        }));
      },

      deleteGoal: (id) => {
        const projects = get().projects.filter(p => p.goalId === id).map(p => p.id);
        const tasks = get().tasks.filter(t => projects.includes(t.projectId)).map(t => t.id);
        set((state) => ({
          goals: state.goals.filter(g => g.id !== id),
          projects: state.projects.filter(p => p.goalId !== id),
          tasks: state.tasks.filter(t => !projects.includes(t.projectId)),
          selected: tasks.includes(state.selected.taskId || '') || projects.includes(state.selected.projectId || '') || state.selected.goalId === id ? {} : state.selected
        }));
      },

      deleteProject: (id) => {
        const tasks = get().tasks.filter(t => t.projectId === id).map(t => t.id);
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id),
          tasks: state.tasks.filter(t => t.projectId !== id),
          selected: tasks.includes(state.selected.taskId || '') || state.selected.projectId === id ? {} : state.selected
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== id),
          selected: state.selected.taskId === id ? {} : state.selected
        }));
      },

      setSelected: (meta) => {
        set({ selected: meta });
      },

      clearSelected: () => {
        set({ selected: {} });
      }
    }),
    {
      name: 'goal-storage',
      storage: createJSONStorage(() => storage),
    }
  )
);

