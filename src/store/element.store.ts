// ============================================================================
// PHASE 8: ELEMENT STORE - STATE MANAGEMENT FOR VISUAL BUILDER
// ============================================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  BuilderElement,
  CanvasSelection,
  CanvasViewport,
  BuilderMode,
  PanelVisibility,
  ElementClipboard,
  ElementTreeNode,
} from '@/types/builder';
import { Breakpoint } from '@/types/styles';

interface HistoryState {
  elements: BuilderElement[];
}

interface ElementState {
  // Page state
  pageId: string | null;
  variantId: string | null;
  elements: BuilderElement[];
  elementMap: Map<string, BuilderElement>;

  // Selection & Focus
  selection: CanvasSelection;

  // Viewport
  viewport: CanvasViewport;

  // UI State
  mode: BuilderMode;
  panels: PanelVisibility;

  // Clipboard
  clipboard: ElementClipboard | null;

  // History for undo/redo
  history: HistoryState[];
  currentHistoryIndex: number;
  maxHistorySize: number;

  // Loading state
  isLoading: boolean;
  isSaving: boolean;

  // Actions - Page
  setPageId: (pageId: string, variantId?: string) => void;
  loadElements: (elements: BuilderElement[]) => void;

  // Actions - Elements
  addElement: (element: BuilderElement) => void;
  updateElement: (id: string, updates: Partial<BuilderElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElement: (id: string, newParentId: string | null, newOrder: number) => void;
  reorderElements: (updates: Array<{ id: string; order: number }>) => void;

  // Actions - Selection
  selectElement: (id: string | null) => void;
  selectElements: (ids: string[]) => void;
  clearSelection: () => void;
  setHoveredElement: (id: string | null) => void;
  setFocusedElement: (id: string | null) => void;

  // Actions - Viewport
  setBreakpoint: (breakpoint: Breakpoint) => void;
  setDeviceFrame: (device: 'mobile' | 'tablet' | 'desktop' | 'none') => void;
  setZoom: (zoom: number) => void;
  setPan: (panX: number, panY: number) => void;
  resetViewport: () => void;

  // Actions - UI Mode
  setMode: (mode: BuilderMode) => void;
  togglePanel: (panel: keyof PanelVisibility) => void;
  setPanelVisibility: (panels: Partial<PanelVisibility>) => void;

  // Actions - Clipboard
  copyElement: (id: string) => void;
  cutElement: (id: string) => void;
  pasteElement: (parentId?: string | null) => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;

  // Actions - Loading
  setLoading: (isLoading: boolean) => void;
  setSaving: (isSaving: boolean) => void;

  // Getters
  getElement: (id: string) => BuilderElement | undefined;
  getSelectedElement: () => BuilderElement | undefined;
  getChildren: (parentId: string | null) => BuilderElement[];
  getParent: (id: string) => BuilderElement | undefined;
  buildElementTree: () => ElementTreeNode[];

  // Reset
  reset: () => void;
}

const initialState = {
  pageId: null,
  variantId: null,
  elements: [],
  elementMap: new Map<string, BuilderElement>(),
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
  mode: 'edit' as BuilderMode,
  panels: {
    leftSidebar: true,
    rightPanel: true,
    toolbar: true,
    elementTree: true,
  },
  clipboard: null,
  history: [],
  currentHistoryIndex: -1,
  maxHistorySize: 50,
  isLoading: false,
  isSaving: false,
};

export const useElementStore = create<ElementState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Page actions
      setPageId: (pageId: string, variantId?: string) =>
        set({ pageId, variantId: variantId || null }),

      loadElements: (elements: BuilderElement[]) =>
        set(() => {
          const elementMap = new Map<string, BuilderElement>();
          elements.forEach((el) => elementMap.set(el.id, el));

          const newState = {
            elements,
            elementMap,
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

      // Element actions
      addElement: (element: BuilderElement) =>
        set((state) => {
          const elements = [...state.elements, element];
          const elementMap = new Map(state.elementMap);
          elementMap.set(element.id, element);

          setTimeout(() => get().saveToHistory(), 0);

          return {
            elements,
            elementMap,
            selection: {
              ...state.selection,
              selectedElementIds: [element.id],
            },
          };
        }),

      updateElement: (id: string, updates: Partial<BuilderElement>) =>
        set((state) => {
          const elements = state.elements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          );
          const elementMap = new Map(state.elementMap);
          const existing = elementMap.get(id);
          if (existing) {
            elementMap.set(id, { ...existing, ...updates });
          }

          setTimeout(() => get().saveToHistory(), 0);

          return { elements, elementMap };
        }),

      deleteElement: (id: string) =>
        set((state) => {
          // Get element and all descendants
          const element = state.elementMap.get(id);
          if (!element) return state;

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
          const elementMap = new Map(state.elementMap);
          toDelete.forEach((deleteId) => elementMap.delete(deleteId));

          setTimeout(() => get().saveToHistory(), 0);

          return {
            elements,
            elementMap,
            selection: {
              ...state.selection,
              selectedElementIds: state.selection.selectedElementIds.filter(
                (selId) => !toDelete.has(selId)
              ),
            },
          };
        }),

      duplicateElement: (id: string) =>
        set((state) => {
          const element = state.elementMap.get(id);
          if (!element) return state;

          const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newElement: BuilderElement = {
            ...element,
            id: newId,
            name: `${element.name} (Copy)`,
            order: element.order + 1,
          };

          const elements = [...state.elements, newElement];
          const elementMap = new Map(state.elementMap);
          elementMap.set(newId, newElement);

          setTimeout(() => get().saveToHistory(), 0);

          return {
            elements,
            elementMap,
            selection: {
              ...state.selection,
              selectedElementIds: [newId],
            },
          };
        }),

      moveElement: (id: string, newParentId: string | null, newOrder: number) =>
        set((state) => {
          const elements = state.elements.map((el) =>
            el.id === id ? { ...el, parentId: newParentId, order: newOrder } : el
          );
          const elementMap = new Map(state.elementMap);
          const element = elementMap.get(id);
          if (element) {
            elementMap.set(id, { ...element, parentId: newParentId, order: newOrder });
          }

          setTimeout(() => get().saveToHistory(), 0);

          return { elements, elementMap };
        }),

      reorderElements: (updates: Array<{ id: string; order: number }>) =>
        set((state) => {
          const updateMap = new Map(updates.map((u) => [u.id, u.order]));
          const elements = state.elements.map((el) => {
            const newOrder = updateMap.get(el.id);
            return newOrder !== undefined ? { ...el, order: newOrder } : el;
          });
          const elementMap = new Map(state.elementMap);
          elements.forEach((el) => elementMap.set(el.id, el));

          setTimeout(() => get().saveToHistory(), 0);

          return { elements, elementMap };
        }),

      // Selection actions
      selectElement: (id: string | null) =>
        set((state) => ({
          selection: {
            ...state.selection,
            selectedElementIds: id ? [id] : [],
            focusedElementId: id,
          },
        })),

      selectElements: (ids: string[]) =>
        set((state) => ({
          selection: {
            ...state.selection,
            selectedElementIds: ids,
            focusedElementId: ids[ids.length - 1] || null,
          },
        })),

      clearSelection: () =>
        set((state) => ({
          selection: {
            ...state.selection,
            selectedElementIds: [],
            focusedElementId: null,
          },
        })),

      setHoveredElement: (id: string | null) =>
        set((state) => ({
          selection: {
            ...state.selection,
            hoveredElementId: id,
          },
        })),

      setFocusedElement: (id: string | null) =>
        set((state) => ({
          selection: {
            ...state.selection,
            focusedElementId: id,
          },
        })),

      // Viewport actions
      setBreakpoint: (breakpoint: Breakpoint) =>
        set((state) => ({
          viewport: { ...state.viewport, breakpoint },
        })),

      setDeviceFrame: (device: 'mobile' | 'tablet' | 'desktop' | 'none') =>
        set((state) => ({
          viewport: { ...state.viewport, deviceFrame: device },
        })),

      setZoom: (zoom: number) =>
        set((state) => ({
          viewport: { ...state.viewport, zoom },
        })),

      setPan: (panX: number, panY: number) =>
        set((state) => ({
          viewport: { ...state.viewport, panX, panY },
        })),

      resetViewport: () =>
        set((state) => ({
          viewport: {
            zoom: 1,
            panX: 0,
            panY: 0,
            breakpoint: state.viewport.breakpoint,
            deviceFrame: state.viewport.deviceFrame,
          },
        })),

      // UI Mode actions
      setMode: (mode: BuilderMode) => set({ mode }),

      togglePanel: (panel: keyof PanelVisibility) =>
        set((state) => ({
          panels: {
            ...state.panels,
            [panel]: !state.panels[panel],
          },
        })),

      setPanelVisibility: (panels: Partial<PanelVisibility>) =>
        set((state) => ({
          panels: {
            ...state.panels,
            ...panels,
          },
        })),

      // Clipboard actions
      copyElement: (id: string) =>
        set((state) => {
          const element = state.elementMap.get(id);
          if (!element) return state;

          return {
            clipboard: {
              type: 'copy' as const,
              element,
            },
          };
        }),

      cutElement: (id: string) =>
        set((state) => {
          const element = state.elementMap.get(id);
          if (!element) return state;

          // Remove from elements
          const elements = state.elements.filter((el) => el.id !== id);
          const elementMap = new Map(state.elementMap);
          elementMap.delete(id);

          setTimeout(() => get().saveToHistory(), 0);

          return {
            elements,
            elementMap,
            clipboard: {
              type: 'cut' as const,
              element,
            },
          };
        }),

      pasteElement: (parentId?: string | null) =>
        set((state) => {
          if (!state.clipboard) return state;

          const newId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newElement: BuilderElement = {
            ...state.clipboard.element,
            id: newId,
            parentId: parentId !== undefined ? parentId : state.clipboard.element.parentId,
          };

          const elements = [...state.elements, newElement];
          const elementMap = new Map(state.elementMap);
          elementMap.set(newId, newElement);

          setTimeout(() => get().saveToHistory(), 0);

          return {
            elements,
            elementMap,
            selection: {
              ...state.selection,
              selectedElementIds: [newId],
            },
            clipboard: state.clipboard.type === 'copy' ? state.clipboard : null,
          };
        }),

      // History actions
      saveToHistory: () =>
        set((state) => {
          const currentState: HistoryState = {
            elements: JSON.parse(JSON.stringify(state.elements)),
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
          const elements = JSON.parse(JSON.stringify(historyState.elements));
          const elementMap = new Map<string, BuilderElement>();
          elements.forEach((el: BuilderElement) => elementMap.set(el.id, el));

          return {
            elements,
            elementMap,
            currentHistoryIndex: newIndex,
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
          const elements = JSON.parse(JSON.stringify(historyState.elements));
          const elementMap = new Map<string, BuilderElement>();
          elements.forEach((el: BuilderElement) => elementMap.set(el.id, el));

          return {
            elements,
            elementMap,
            currentHistoryIndex: newIndex,
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

      // Loading actions
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setSaving: (isSaving: boolean) => set({ isSaving }),

      // Getters
      getElement: (id: string) => {
        return get().elementMap.get(id);
      },

      getSelectedElement: () => {
        const state = get();
        const selectedId = state.selection.selectedElementIds[0];
        return selectedId ? state.elementMap.get(selectedId) : undefined;
      },

      getChildren: (parentId: string | null) => {
        const state = get();
        return state.elements
          .filter((el) => el.parentId === parentId)
          .sort((a, b) => a.order - b.order);
      },

      getParent: (id: string) => {
        const state = get();
        const element = state.elementMap.get(id);
        if (!element || !element.parentId) return undefined;
        return state.elementMap.get(element.parentId);
      },

      buildElementTree: () => {
        const state = get();

        const buildNode = (element: BuilderElement): ElementTreeNode => {
          const children = get()
            .getChildren(element.id)
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

      // Reset
      reset: () => set({ ...initialState }),
    }),
    { name: 'ElementStore' }
  )
);
