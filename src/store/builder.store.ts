import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  BuilderElement,
  ElementType,
  PageMetadata as NewPageMetadata,
  BuilderComponent,
  CanvasViewport,
  CanvasSelection,
  ElementTreeNode
} from '@/types/builder';
import { Breakpoint } from '@/types/styles';
import { ComponentType } from '@/types/prisma';

// Re-exporting for backward compatibility if needed, though we should transition
export type { BuilderComponent };
export { ComponentType };

export interface PageMetadata extends NewPageMetadata {
  id?: string;
}

interface HistoryState {
  components: BuilderComponent[];
  elements: BuilderElement[];
  metadata: PageMetadata;
}

interface BuilderState {
  // Page state
  pageId?: string;
  metadata: PageMetadata;
  components: BuilderComponent[];
  elements: BuilderElement[];

  // UI state
  selection: CanvasSelection;
  selectedComponentId: string | null;

  viewport: CanvasViewport;
  isDragging: boolean;
  isSaving: boolean;

  // History for undo/redo
  history: HistoryState[];
  currentHistoryIndex: number;
  maxHistorySize: number;

  // Actions
  setPageId: (id: string) => void;
  setMetadata: (metadata: Partial<PageMetadata>) => void;

  // Component management (Legacy)
  addComponent: (component: BuilderComponent, index?: number) => void;
  updateComponent: (id: string, updates: Partial<BuilderComponent>) => void;
  deleteComponent: (id: string) => void;
  reorderComponent: (id: string, newOrder: number) => void;
  duplicateComponent: (id: string) => void;

  // Element management (Phase 8)
  addElement: (element: BuilderElement, index?: number) => void;
  updateElement: (id: string, updates: Partial<BuilderElement>) => void;
  deleteElement: (id: string) => void;
  reorderElement: (id: string, newOrder: number, newParentId?: string | null) => void;
  duplicateElement: (id: string) => void;

  // Selection
  selectComponent: (id: string | null) => void;
  selectElement: (id: string | null) => void;
  setHoveredElement: (id: string | null) => void;

  // Viewport
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setZoom: (zoom: number) => void;
  setDeviceFrame: (frame: CanvasViewport['deviceFrame']) => void;

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
  loadPage: (pageData: {
    id: string;
    metadata: PageMetadata;
    components: BuilderComponent[];
    elements?: BuilderElement[];
  }) => void;
  reset: () => void;

  // Helpers
  getSelectedComponent: () => BuilderComponent | null;
  getSelectedElement: () => BuilderElement | null;
  getElementById: (id: string) => BuilderElement | null;
  getElementsByParentId: (parentId: string | null) => BuilderElement[];
  buildElementTree: () => ElementTreeNode[];
}

const initialMetadata: PageMetadata = {
  title: 'Untitled Page',
  slug: '',
  description: '',
};

const initialState = {
  metadata: initialMetadata,
  components: [],
  elements: [],
  selection: {
    selectedElementIds: [],
    hoveredElementId: null,
    focusedElementId: null,
  },
  viewport: {
    zoom: 1,
    panX: 0,
    panY: 0,
    breakpoint: 'base' as Breakpoint,
    deviceFrame: 'none' as const,
  },
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

      // --- Legacy Component Actions ---
      addComponent: (component: BuilderComponent, index?: number) =>
        set((state) => {
          const newComponents = [...state.components];

          if (index !== undefined) {
            newComponents.splice(index, 0, component);
          } else {
            newComponents.push(component);
          }

          const reorderedComponents = newComponents.map((comp, idx) => ({
            ...comp,
            order: idx,
          }));

          setTimeout(() => get().saveToHistory(), 0);

          return {
            components: reorderedComponents,
            selectedComponentId: component.id,
            selection: { ...state.selection, selectedElementIds: [] },
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

          const [movedComponent] = newComponents.splice(oldOrder, 1);
          newComponents.splice(newOrder, 0, movedComponent);

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

      // --- New Element Actions (Phase 8) ---
      addElement: (element: BuilderElement, index?: number) =>
        set((state) => {
          const newElements = [...state.elements, element];

          setTimeout(() => get().saveToHistory(), 0);

          return {
            elements: newElements,
            selection: {
              ...state.selection,
              selectedElementIds: [element.id],
            },
            selectedComponentId: null,
          };
        }),

      updateElement: (id: string, updates: Partial<BuilderElement>) =>
        set((state) => {
          const elements = state.elements.map((el) =>
            el.id === id ? { ...el, ...updates, updatedAt: new Date() } : el
          );

          setTimeout(() => get().saveToHistory(), 0);

          return { elements };
        }),

      deleteElement: (id: string) =>
        set((state) => {
          const toDelete = new Set<string>([id]);
          const findDescendants = (parentId: string) => {
            state.elements
              .filter((el) => el.parentId === parentId)
              .forEach((child) => {
                toDelete.add(child.id);
                findDescendants(child.id);
              });
          };
          findDescendants(id);

          const elements = state.elements.filter((el) => !toDelete.has(el.id));

          setTimeout(() => get().saveToHistory(), 0);

          return {
            elements,
            selection: {
              ...state.selection,
              selectedElementIds: state.selection.selectedElementIds.filter(
                (selId) => !toDelete.has(selId)
              ),
            },
          };
        }),

      reorderElement: (id: string, newOrder: number, newParentId?: string | null) =>
        set((state) => {
          const elements = state.elements.map((el) => {
            if (el.id === id) {
              return {
                ...el,
                order: newOrder,
                parentId: newParentId !== undefined ? newParentId : el.parentId
              };
            }
            return el;
          });

          setTimeout(() => get().saveToHistory(), 0);
          return { elements };
        }),

      duplicateElement: (id: string) =>
        set((state) => {
          const element = state.elements.find((el) => el.id === id);
          if (!element) return state;

          const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newElement: BuilderElement = {
            ...element,
            id: newId,
            name: `${element.name} (Copy)`,
            order: element.order + 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          setTimeout(() => get().saveToHistory(), 0);

          return {
            elements: [...state.elements, newElement],
            selection: {
              ...state.selection,
              selectedElementIds: [newId],
            },
          };
        }),

      // --- Selection Actions ---
      selectComponent: (id: string | null) =>
        set((state) => ({
          selectedComponentId: id,
          selection: { ...state.selection, selectedElementIds: [] }
        })),

      selectElement: (id: string | null) =>
        set((state) => ({
          selection: { ...state.selection, selectedElementIds: id ? [id] : [], focusedElementId: id },
          selectedComponentId: null
        })),

      setHoveredElement: (id: string | null) =>
        set((state) => ({
          selection: { ...state.selection, hoveredElementId: id }
        })),

      // --- Viewport Actions ---
      setBreakpoint: (breakpoint: Breakpoint) =>
        set((state) => ({
          viewport: { ...state.viewport, breakpoint }
        })),

      setZoom: (zoom: number) =>
        set((state) => ({
          viewport: { ...state.viewport, zoom }
        })),

      setDeviceFrame: (frame: CanvasViewport['deviceFrame']) =>
        set((state) => ({
          viewport: { ...state.viewport, deviceFrame: frame }
        })),

      setIsDragging: (isDragging: boolean) => set({ isDragging }),

      // --- History Actions ---
      saveToHistory: () =>
        set((state) => {
          const currentState: HistoryState = {
            components: JSON.parse(JSON.stringify(state.components)),
            elements: JSON.parse(JSON.stringify(state.elements)),
            metadata: JSON.parse(JSON.stringify(state.metadata)),
          };

          const newHistory = state.history.slice(0, state.currentHistoryIndex + 1);
          newHistory.push(currentState);

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
            elements: JSON.parse(JSON.stringify(historyState.elements)),
            metadata: JSON.parse(JSON.stringify(historyState.metadata)),
            currentHistoryIndex: newIndex,
            selectedComponentId: null,
            selection: {
              selectedElementIds: [],
              hoveredElementId: null,
              focusedElementId: null,
            },
          };
        }),

      redo: () =>
        set((state) => {
          if (!get().canRedo()) return state;

          const newIndex = state.currentHistoryIndex + 1;
          const historyState = state.history[newIndex];

          return {
            components: JSON.parse(JSON.stringify(historyState.components)),
            elements: JSON.parse(JSON.stringify(historyState.elements)),
            metadata: JSON.parse(JSON.stringify(historyState.metadata)),
            currentHistoryIndex: newIndex,
            selectedComponentId: null,
            selection: {
              selectedElementIds: [],
              hoveredElementId: null,
              focusedElementId: null,
            },
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
            elements: pageData.elements || [],
            selectedComponentId: null,
            selection: {
              selectedElementIds: [],
              hoveredElementId: null,
              focusedElementId: null,
            },
            history: [],
            currentHistoryIndex: -1,
          };

          setTimeout(() => get().saveToHistory(), 0);

          return newState;
        }),

      reset: () =>
        set(() => {
          return { ...initialState };
        }),

      // --- Helpers ---
      getSelectedComponent: () => {
        const state = get();
        if (!state.selectedComponentId) return null;
        return state.components.find((c) => c.id === state.selectedComponentId) || null;
      },

      getSelectedElement: () => {
        const state = get();
        const selectedId = state.selection.selectedElementIds[0];
        if (!selectedId) return null;
        return state.elements.find((el) => el.id === selectedId) || null;
      },

      getElementById: (id: string) => {
        return get().elements.find((el) => el.id === id) || null;
      },

      getElementsByParentId: (parentId: string | null) => {
        return get().elements
          .filter((el) => el.parentId === parentId)
          .sort((a, b) => a.order - b.order);
      },

      buildElementTree: () => {
        const state = get();

        const buildNode = (element: BuilderElement): ElementTreeNode => {
          const children = get()
            .getElementsByParentId(element.id)
            .map(buildNode);

          return {
            element,
            children,
            isExpanded: false,
            isSelected: state.selection.selectedElementIds.includes(element.id),
          };
        };

        // Get top-level elements (no parent)
        const topLevel = state.elements
          .filter((el) => !el.parentId)
          .sort((a, b) => a.order - b.order);

        return topLevel.map(buildNode);
      },
    }),
    { name: 'BuilderStore' }
  )
);
