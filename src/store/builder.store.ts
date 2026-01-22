import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Component definition matching Prisma schema
export interface BuilderComponent {
  id: string;
  type: ComponentType;
  name: string;
  order: number;
  config: Record<string, any>;
  styles: Record<string, any>;
  content: Record<string, any>;
}

export enum ComponentType {
  HERO = 'HERO',
  CTA = 'CTA',
  PRICING = 'PRICING',
  FEATURES = 'FEATURES',
  TESTIMONIALS = 'TESTIMONIALS',
  FAQ = 'FAQ',
  FORM = 'FORM',
  NEWSLETTER = 'NEWSLETTER',
  HEADER = 'HEADER',
  FOOTER = 'FOOTER',
  CUSTOM = 'CUSTOM',
}

export interface PageMetadata {
  id?: string;
  title: string;
  slug: string;
  description?: string;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  favicon?: string;
}

interface HistoryState {
  components: BuilderComponent[];
  metadata: PageMetadata;
}

interface BuilderState {
  // Page state
  pageId?: string;
  metadata: PageMetadata;
  components: BuilderComponent[];

  // UI state
  selectedComponentId: string | null;
  isDragging: boolean;
  isSaving: boolean;

  // History for undo/redo
  history: HistoryState[];
  currentHistoryIndex: number;
  maxHistorySize: number;

  // Actions
  setPageId: (id: string) => void;
  setMetadata: (metadata: Partial<PageMetadata>) => void;

  // Component management
  addComponent: (component: BuilderComponent, index?: number) => void;
  updateComponent: (id: string, updates: Partial<BuilderComponent>) => void;
  deleteComponent: (id: string) => void;
  reorderComponent: (id: string, newOrder: number) => void;
  duplicateComponent: (id: string) => void;

  // Selection
  selectComponent: (id: string | null) => void;

  // Drag state
  setIsDragging: (isDragging: boolean) => void;

  // History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;

  // Save/Load
  setSaving: (isSaving: boolean) => void;
  loadPage: (pageData: { id: string; metadata: PageMetadata; components: BuilderComponent[] }) => void;
  reset: () => void;

  // Get selected component
  getSelectedComponent: () => BuilderComponent | null;
}

const initialMetadata: PageMetadata = {
  title: 'Untitled Page',
  slug: '',
  description: '',
};

const initialState = {
  metadata: initialMetadata,
  components: [],
  selectedComponentId: null,
  isDragging: false,
  isSaving: false,
  history: [],
  currentHistoryIndex: -1,
  maxHistorySize: 50,
};

export const useBuilderStore = create<BuilderState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setPageId: (id: string) => set({ pageId: id }),

      setMetadata: (metadata: Partial<PageMetadata>) =>
        set((state) => {
          const newState = {
            metadata: { ...state.metadata, ...metadata },
          };
          setTimeout(() => get().saveToHistory(), 0);
          return newState;
        }),

      addComponent: (component: BuilderComponent, index?: number) =>
        set((state) => {
          const newComponents = [...state.components];

          if (index !== undefined) {
            newComponents.splice(index, 0, component);
          } else {
            newComponents.push(component);
          }

          // Reorder all components
          const reorderedComponents = newComponents.map((comp, idx) => ({
            ...comp,
            order: idx,
          }));

          setTimeout(() => get().saveToHistory(), 0);

          return {
            components: reorderedComponents,
            selectedComponentId: component.id,
          };
        }),

      updateComponent: (id: string, updates: Partial<BuilderComponent>) =>
        set((state) => {
          const components = state.components.map((comp) =>
            comp.id === id ? { ...comp, ...updates } : comp
          );

          setTimeout(() => get().saveToHistory(), 0);

          return { components };
        }),

      deleteComponent: (id: string) =>
        set((state) => {
          const components = state.components
            .filter((comp) => comp.id !== id)
            .map((comp, idx) => ({ ...comp, order: idx }));

          setTimeout(() => get().saveToHistory(), 0);

          return {
            components,
            selectedComponentId:
              state.selectedComponentId === id ? null : state.selectedComponentId,
          };
        }),

      reorderComponent: (id: string, newOrder: number) =>
        set((state) => {
          const component = state.components.find((c) => c.id === id);
          if (!component) return state;

          const oldOrder = component.order;
          const newComponents = [...state.components];

          // Remove component from old position
          const [movedComponent] = newComponents.splice(oldOrder, 1);

          // Insert at new position
          newComponents.splice(newOrder, 0, movedComponent);

          // Reorder all components
          const reorderedComponents = newComponents.map((comp, idx) => ({
            ...comp,
            order: idx,
          }));

          setTimeout(() => get().saveToHistory(), 0);

          return { components: reorderedComponents };
        }),

      duplicateComponent: (id: string) =>
        set((state) => {
          const component = state.components.find((c) => c.id === id);
          if (!component) return state;

          const newComponent: BuilderComponent = {
            ...component,
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${component.name} (Copy)`,
            order: component.order + 1,
          };

          const newComponents = [...state.components];
          newComponents.splice(component.order + 1, 0, newComponent);

          // Reorder all components
          const reorderedComponents = newComponents.map((comp, idx) => ({
            ...comp,
            order: idx,
          }));

          setTimeout(() => get().saveToHistory(), 0);

          return {
            components: reorderedComponents,
            selectedComponentId: newComponent.id,
          };
        }),

      selectComponent: (id: string | null) =>
        set({ selectedComponentId: id }),

      setIsDragging: (isDragging: boolean) => set({ isDragging }),

      saveToHistory: () =>
        set((state) => {
          const currentState: HistoryState = {
            components: JSON.parse(JSON.stringify(state.components)),
            metadata: JSON.parse(JSON.stringify(state.metadata)),
          };

          // Remove any history after current index
          const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);

          // Add current state to history
          newHistory.push(currentState);

          // Limit history size
          if (newHistory.length > state.maxHistorySize) {
            newHistory.shift();
          }

          return {
            history: newHistory,
            currentHistoryIndex: newHistory.length - 1,
          };
        }),

      undo: () =>
        set((state) => {
          if (!get().canUndo()) return state;

          const newIndex = state.currentHistoryIndex - 1;
          const historyState = state.history[newIndex];

          return {
            components: JSON.parse(JSON.stringify(historyState.components)),
            metadata: JSON.parse(JSON.stringify(historyState.metadata)),
            currentHistoryIndex: newIndex,
            selectedComponentId: null,
          };
        }),

      redo: () =>
        set((state) => {
          if (!get().canRedo()) return state;

          const newIndex = state.currentHistoryIndex + 1;
          const historyState = state.history[newIndex];

          return {
            components: JSON.parse(JSON.stringify(historyState.components)),
            metadata: JSON.parse(JSON.stringify(historyState.metadata)),
            currentHistoryIndex: newIndex,
            selectedComponentId: null,
          };
        }),

      canUndo: () => {
        const state = get();
        return state.currentHistoryIndex > 0;
      },

      canRedo: () => {
        const state = get();
        return state.currentHistoryIndex < state.history.length - 1;
      },

      setSaving: (isSaving: boolean) => set({ isSaving }),

      loadPage: (pageData) =>
        set(() => {
          const newState = {
            pageId: pageData.id,
            metadata: pageData.metadata,
            components: pageData.components,
            selectedComponentId: null,
            history: [],
            currentHistoryIndex: -1,
          };

          // Save initial state to history
          setTimeout(() => get().saveToHistory(), 0);

          return newState;
        }),

      reset: () =>
        set(() => {
          return { ...initialState };
        }),

      getSelectedComponent: () => {
        const state = get();
        if (!state.selectedComponentId) return null;
        return state.components.find((c) => c.id === state.selectedComponentId) || null;
      },
    }),
    { name: 'BuilderStore' }
  )
);
