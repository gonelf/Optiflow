'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings2, Code, FileText, AlertCircle } from 'lucide-react';

interface PageSettings {
  title: string;
  slug: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  customHead: string;
}

interface PageSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  initialSettings: PageSettings;
  onSave: (settings: PageSettings) => Promise<void>;
}

export function PageSettingsDialog({
  open,
  onOpenChange,
  pageId,
  initialSettings,
  onSave,
}: PageSettingsDialogProps) {
  const [settings, setSettings] = useState<PageSettings>(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Reset settings when dialog opens
  useEffect(() => {
    if (open) {
      setSettings(initialSettings);
    }
  }, [open, initialSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Page Settings
          </DialogTitle>
          <DialogDescription>
            Configure page metadata, SEO settings, and custom header scripts.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general" className="text-xs">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              General
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs">
              <Settings2 className="h-3.5 w-3.5 mr-1.5" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="scripts" className="text-xs">
              <Code className="h-3.5 w-3.5 mr-1.5" />
              Header Scripts
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto py-4">
            <TabsContent value="general" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  placeholder="My Landing Page"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">/p/</span>
                  <Input
                    id="slug"
                    value={settings.slug}
                    onChange={(e) => setSettings({ ...settings, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="my-landing-page"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The URL path for your published page.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={settings.description || ''}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  placeholder="A brief description of your page..."
                  className="w-full h-20 px-3 py-2 border rounded text-sm resize-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </TabsContent>

            <TabsContent value="seo" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">SEO Title</Label>
                <Input
                  id="seoTitle"
                  value={settings.seoTitle || ''}
                  onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
                  placeholder="Page Title | Your Brand"
                />
                <p className="text-xs text-muted-foreground">
                  The title shown in search engine results. Recommended: 50-60 characters.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seoDescription">SEO Description</Label>
                <textarea
                  id="seoDescription"
                  value={settings.seoDescription || ''}
                  onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
                  placeholder="A compelling description for search engines..."
                  className="w-full h-24 px-3 py-2 border rounded text-sm resize-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  The description shown in search engine results. Recommended: 150-160 characters.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="scripts" className="mt-0 space-y-4">
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium">Header Scripts</p>
                  <p className="mt-1">
                    Add custom scripts to the &lt;head&gt; section of your page. This is useful for
                    analytics (Google Analytics, Plausible), tracking pixels, chat widgets, and other
                    third-party integrations.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customHead">Custom Head Code</Label>
                <textarea
                  id="customHead"
                  value={settings.customHead || ''}
                  onChange={(e) => setSettings({ ...settings, customHead: e.target.value })}
                  placeholder={`<!-- Example: Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>

<!-- Example: Meta Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  // ... your pixel code
</script>`}
                  className="w-full h-64 px-3 py-2 border rounded font-mono text-xs bg-muted/20 resize-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
                <p className="text-xs text-muted-foreground">
                  This code will be injected into the &lt;head&gt; section of your published page.
                  Scripts run on page load.
                </p>
              </div>

              <div className="p-3 bg-muted/30 rounded-lg space-y-2">
                <p className="text-xs font-medium">Common use cases:</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Google Analytics / GA4</li>
                  <li>Google Tag Manager</li>
                  <li>Meta (Facebook) Pixel</li>
                  <li>Hotjar / FullStory / Session recording</li>
                  <li>Intercom / Crisp / Chat widgets</li>
                  <li>Custom fonts or stylesheets</li>
                </ul>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
