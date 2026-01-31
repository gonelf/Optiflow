'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, Check } from 'lucide-react';
import { THEMES, Theme, applyThemeToAllElements } from '@/lib/themes';
import { cn } from '@/lib/utils';

interface ThemeChangerProps {
  currentThemeId: string;
  onThemeChange: (themeId: string, elements: any[]) => void;
  elements: any[];
}

export function ThemeChanger({ currentThemeId, onThemeChange, elements }: ThemeChangerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentTheme = THEMES.find(t => t.id === currentThemeId) || THEMES[0];

  const handleThemeChange = (theme: Theme) => {
    // Apply theme to all elements
    const updatedElements = applyThemeToAllElements(elements, theme);
    onThemeChange(theme.id, updatedElements);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          Theme: {currentTheme.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm">Choose Theme</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Select a color theme for your page
          </p>
        </div>
        <ScrollArea className="h-96">
          <div className="p-4 space-y-3">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme)}
                className={cn(
                  'w-full text-left p-4 border-2 rounded-lg transition-all hover:border-primary/50',
                  currentThemeId === theme.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold">{theme.name}</h4>
                      {currentThemeId === theme.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {theme.description}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <div
                        className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors.primary }}
                        title="Primary"
                      />
                      <div
                        className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors.secondary }}
                        title="Secondary"
                      />
                      <div
                        className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Accent"
                      />
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function ThemePreview({ theme }: { theme: Theme }) {
  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border">
      <div className="space-y-2">
        <Label className="text-xs">Colors</Label>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <div
              className="h-12 rounded border"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <p className="text-[10px] text-muted-foreground text-center">Primary</p>
          </div>
          <div className="space-y-1">
            <div
              className="h-12 rounded border"
              style={{ backgroundColor: theme.colors.secondary }}
            />
            <p className="text-[10px] text-muted-foreground text-center">Secondary</p>
          </div>
          <div className="space-y-1">
            <div
              className="h-12 rounded border"
              style={{ backgroundColor: theme.colors.accent }}
            />
            <p className="text-[10px] text-muted-foreground text-center">Accent</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs">Preview</Label>
        <div className="space-y-2 text-xs">
          <button className={cn('w-full px-3 py-2 rounded font-medium transition-colors', theme.tailwindClasses.primary.bg, theme.tailwindClasses.primary.hover, 'text-white')}>
            Primary Button
          </button>
          <button className={cn('w-full px-3 py-2 rounded font-medium transition-colors', theme.tailwindClasses.secondary.bg, theme.tailwindClasses.secondary.hover, theme.tailwindClasses.secondary.text)}>
            Secondary Button
          </button>
          <div className={cn('p-3 rounded border-l-4', theme.tailwindClasses.accent.border, 'bg-gray-50', theme.tailwindClasses.accent.text)}>
            Accent alert box
          </div>
        </div>
      </div>
    </div>
  );
}
