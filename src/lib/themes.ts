export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  tailwindClasses: {
    primary: {
      bg: string;
      text: string;
      border: string;
      hover: string;
    };
    secondary: {
      bg: string;
      text: string;
      border: string;
      hover: string;
    };
    accent: {
      bg: string;
      text: string;
      border: string;
      hover: string;
    };
  };
}

export const THEMES: Theme[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Clean blue theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      border: '#e2e8f0',
    },
    tailwindClasses: {
      primary: {
        bg: 'bg-blue-600',
        text: 'text-blue-600',
        border: 'border-blue-600',
        hover: 'hover:bg-blue-700',
      },
      secondary: {
        bg: 'bg-gray-200',
        text: 'text-gray-800',
        border: 'border-gray-200',
        hover: 'hover:bg-gray-300',
      },
      accent: {
        bg: 'bg-purple-600',
        text: 'text-purple-600',
        border: 'border-purple-600',
        hover: 'hover:bg-purple-700',
      },
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calming teal and blue',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#3b82f6',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f0fdfa',
      border: '#5eead4',
    },
    tailwindClasses: {
      primary: {
        bg: 'bg-cyan-500',
        text: 'text-cyan-500',
        border: 'border-cyan-500',
        hover: 'hover:bg-cyan-600',
      },
      secondary: {
        bg: 'bg-cyan-700',
        text: 'text-cyan-700',
        border: 'border-cyan-700',
        hover: 'hover:bg-cyan-800',
      },
      accent: {
        bg: 'bg-blue-600',
        text: 'text-blue-600',
        border: 'border-blue-600',
        hover: 'hover:bg-blue-700',
      },
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm orange and pink',
    colors: {
      primary: '#f97316',
      secondary: '#fb923c',
      accent: '#ec4899',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#fff7ed',
      border: '#fed7aa',
    },
    tailwindClasses: {
      primary: {
        bg: 'bg-orange-500',
        text: 'text-orange-500',
        border: 'border-orange-500',
        hover: 'hover:bg-orange-600',
      },
      secondary: {
        bg: 'bg-orange-400',
        text: 'text-orange-400',
        border: 'border-orange-400',
        hover: 'hover:bg-orange-500',
      },
      accent: {
        bg: 'bg-pink-500',
        text: 'text-pink-500',
        border: 'border-pink-500',
        hover: 'hover:bg-pink-600',
      },
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Natural green tones',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      accent: '#84cc16',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f0fdf4',
      border: '#86efac',
    },
    tailwindClasses: {
      primary: {
        bg: 'bg-emerald-500',
        text: 'text-emerald-500',
        border: 'border-emerald-500',
        hover: 'hover:bg-emerald-600',
      },
      secondary: {
        bg: 'bg-emerald-600',
        text: 'text-emerald-600',
        border: 'border-emerald-600',
        hover: 'hover:bg-emerald-700',
      },
      accent: {
        bg: 'bg-lime-500',
        text: 'text-lime-500',
        border: 'border-lime-500',
        hover: 'hover:bg-lime-600',
      },
    },
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Deep purple and gold',
    colors: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#f59e0b',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#faf5ff',
      border: '#c4b5fd',
    },
    tailwindClasses: {
      primary: {
        bg: 'bg-violet-600',
        text: 'text-violet-600',
        border: 'border-violet-600',
        hover: 'hover:bg-violet-700',
      },
      secondary: {
        bg: 'bg-violet-700',
        text: 'text-violet-700',
        border: 'border-violet-700',
        hover: 'hover:bg-violet-800',
      },
      accent: {
        bg: 'bg-amber-500',
        text: 'text-amber-500',
        border: 'border-amber-500',
        hover: 'hover:bg-amber-600',
      },
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark theme with neon accents',
    colors: {
      primary: '#0ea5e9',
      secondary: '#6366f1',
      accent: '#a855f7',
      background: '#0f172a',
      foreground: '#f8fafc',
      muted: '#1e293b',
      border: '#334155',
    },
    tailwindClasses: {
      primary: {
        bg: 'bg-sky-500',
        text: 'text-sky-500',
        border: 'border-sky-500',
        hover: 'hover:bg-sky-600',
      },
      secondary: {
        bg: 'bg-indigo-500',
        text: 'text-indigo-500',
        border: 'border-indigo-500',
        hover: 'hover:bg-indigo-600',
      },
      accent: {
        bg: 'bg-purple-500',
        text: 'text-purple-500',
        border: 'border-purple-500',
        hover: 'hover:bg-purple-600',
      },
    },
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Classic black and white',
    colors: {
      primary: '#0f172a',
      secondary: '#475569',
      accent: '#64748b',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      border: '#cbd5e1',
    },
    tailwindClasses: {
      primary: {
        bg: 'bg-slate-900',
        text: 'text-slate-900',
        border: 'border-slate-900',
        hover: 'hover:bg-slate-800',
      },
      secondary: {
        bg: 'bg-slate-600',
        text: 'text-slate-600',
        border: 'border-slate-600',
        hover: 'hover:bg-slate-700',
      },
      accent: {
        bg: 'bg-slate-500',
        text: 'text-slate-500',
        border: 'border-slate-500',
        hover: 'hover:bg-slate-600',
      },
    },
  },
  {
    id: 'cherry',
    name: 'Cherry',
    description: 'Bold red and crimson',
    colors: {
      primary: '#dc2626',
      secondary: '#991b1b',
      accent: '#be123c',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#fef2f2',
      border: '#fecaca',
    },
    tailwindClasses: {
      primary: {
        bg: 'bg-red-600',
        text: 'text-red-600',
        border: 'border-red-600',
        hover: 'hover:bg-red-700',
      },
      secondary: {
        bg: 'bg-red-800',
        text: 'text-red-800',
        border: 'border-red-800',
        hover: 'hover:bg-red-900',
      },
      accent: {
        bg: 'bg-rose-600',
        text: 'text-rose-600',
        border: 'border-rose-600',
        hover: 'hover:bg-rose-700',
      },
    },
  },
];

export function getTheme(themeId: string): Theme {
  return THEMES.find(t => t.id === themeId) || THEMES[0];
}

export function applyThemeToElement(element: any, theme: Theme): any {
  const className = element.className || '';

  // Replace color classes with theme colors
  let updatedClassName = className
    // Primary colors
    .replace(/bg-blue-\d+/g, theme.tailwindClasses.primary.bg)
    .replace(/text-blue-\d+/g, theme.tailwindClasses.primary.text)
    .replace(/border-blue-\d+/g, theme.tailwindClasses.primary.border)
    .replace(/hover:bg-blue-\d+/g, theme.tailwindClasses.primary.hover)
    // Secondary colors (gray)
    .replace(/bg-gray-\d+/g, theme.tailwindClasses.secondary.bg)
    .replace(/text-gray-\d+/g, theme.tailwindClasses.secondary.text)
    .replace(/border-gray-\d+/g, theme.tailwindClasses.secondary.border)
    .replace(/hover:bg-gray-\d+/g, theme.tailwindClasses.secondary.hover)
    // Accent colors (purple)
    .replace(/bg-purple-\d+/g, theme.tailwindClasses.accent.bg)
    .replace(/text-purple-\d+/g, theme.tailwindClasses.accent.text)
    .replace(/border-purple-\d+/g, theme.tailwindClasses.accent.border)
    .replace(/hover:bg-purple-\d+/g, theme.tailwindClasses.accent.hover);

  return {
    ...element,
    className: updatedClassName,
  };
}

export function applyThemeToAllElements(elements: any[], theme: Theme): any[] {
  return elements.map(element => {
    const updated = applyThemeToElement(element, theme);
    if (element.children && element.children.length > 0) {
      updated.children = applyThemeToAllElements(element.children, theme);
    }
    return updated;
  });
}
