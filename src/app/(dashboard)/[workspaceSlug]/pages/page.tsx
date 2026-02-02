'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useWorkspace } from '@/hooks/use-workspace';
import {
  Plus,
  Search,
  FileText,
  MoreVertical,
  Trash2,
  Eye,
  Copy,
  Edit,
  ExternalLink,
  Sparkles,
  Globe,
  GlobeLock,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  updatedAt: string;
  screenshotUrl: string | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    components: number;
  };
}

export default function PagesListPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const workspaceSlug = params.workspaceSlug as string;
  const { currentWorkspace, isLoading: isWorkspaceLoading, isError: isWorkspaceError } = useWorkspace(workspaceSlug);

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAICreateDialogOpen, setIsAICreateDialogOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [aiPagePurpose, setAiPagePurpose] = useState('');
  const [aiDesignStyle, setAiDesignStyle] = useState('');
  const [aiDesignMode, setAiDesignMode] = useState<'consistent' | 'new'>('consistent');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  const fetchPages = useCallback(async () => {
    if (!currentWorkspace?.id) return;

    try {
      setIsLoading(true);

      // Fetch pages using workspace ID from hook
      const response = await fetch(`/api/pages?workspaceId=${currentWorkspace.id}`);
      if (!response.ok) throw new Error('Failed to fetch pages');

      const data = await response.json();
      setPages(data.pages || []);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pages. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id, toast]);

  useEffect(() => {
    // Redirect to dashboard if workspace doesn't exist
    if (!isWorkspaceLoading && !currentWorkspace) {
      router.push('/dashboard');
      return;
    }
    fetchPages();
  }, [fetchPages, currentWorkspace, isWorkspaceLoading, router]);

  const handleCreatePage = async () => {
    if (!newPageTitle || !newPageSlug) {
      toast({
        title: 'Error',
        description: 'Please provide a title and slug for the page.',
        variant: 'destructive',
      });
      return;
    }

    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);

      // Create page using workspace ID from hook
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          title: newPageTitle,
          slug: newPageSlug,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create page');
      }

      const data = await response.json();

      toast({
        title: 'Page created',
        description: 'Your new page has been created successfully.',
      });

      // Reset form
      setNewPageTitle('');
      setNewPageSlug('');
      setIsCreateDialogOpen(false);

      // Navigate to builder
      router.push(`/${workspaceSlug}/pages/${data.page.id}`);
    } catch (error: any) {
      console.error('Error creating page:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create page. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete page');

      toast({
        title: 'Page deleted',
        description: 'The page has been deleted successfully.',
      });

      // Refresh pages list
      fetchPages();
    } catch (error) {
      console.error('Error deleting page:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete page. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePublishPage = async (pageId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    const action = newStatus === 'PUBLISHED' ? 'publish' : 'unpublish';

    try {
      const response = await fetch(`/api/pages/${pageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Failed to ${action} page`);
      }

      const page = pages.find(p => p.id === pageId);
      toast({
        title: newStatus === 'PUBLISHED' ? 'Page published' : 'Page unpublished',
        description: newStatus === 'PUBLISHED'
          ? `Your page is now live at /p/${page?.slug}`
          : 'Your page has been unpublished.',
      });

      // Refresh pages list
      fetchPages();
    } catch (error: any) {
      console.error(`Error ${action}ing page:`, error);
      toast({
        title: 'Error',
        description: error.message || `Failed to ${action} page. Please try again.`,
        variant: 'destructive',
      });
    }
  };

  const handlePreviewPage = (page: Page) => {
    window.open(`/${workspaceSlug}/preview/${page.id}`, '_blank');
  };

  const handleViewPublished = (page: Page) => {
    window.open(`/p/${page.slug}`, '_blank');
  };

  const handleAICreatePage = async () => {
    if (!aiPagePurpose || aiPagePurpose.length < 10) {
      toast({
        title: 'Error',
        description: 'Please provide a detailed description of what the page is for (at least 10 characters).',
        variant: 'destructive',
      });
      return;
    }

    if (!currentWorkspace?.id) {
      toast({
        title: 'Error',
        description: 'Workspace not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAIGenerating(true);

      // Create page with AI using workspace ID from hook
      const response = await fetch('/api/ai/ai-create-page', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          pagePurpose: aiPagePurpose,
          designMode: aiDesignMode,
          designStyle: (pages.length === 0 || aiDesignMode === 'new') && aiDesignStyle ? aiDesignStyle : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create page with AI');
      }

      const data = await response.json();

      toast({
        title: 'Page created with AI',
        description: 'Your AI-generated page has been created successfully.',
      });

      // Reset form
      setAiPagePurpose('');
      setAiDesignStyle('');
      setAiDesignMode('consistent');
      setIsAICreateDialogOpen(false);

      // Navigate to new AI editor
      const redirectUrl = data.redirectUrl || `/${workspaceSlug}/ai-pages/${data.page.id}`;
      router.push(redirectUrl);
    } catch (error: any) {
      console.error('Error creating page with AI:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create page with AI. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAIGenerating(false);
    }
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pages</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your landing pages
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAICreateDialogOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              Create with AI
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Pages List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading pages...</p>
        </div>
      ) : filteredPages.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No pages found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search'
              : 'Get started by creating your first page'}
          </p>
          {!searchQuery && (
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Page
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page) => (
            <Card key={page.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Screenshot Area */}
              <div
                className="group relative aspect-video w-full cursor-pointer overflow-hidden bg-muted"
                onClick={() => router.push(`/${workspaceSlug}/pages/${page.id}`)}
              >
                {page.screenshotUrl ? (
                  <img
                    src={page.screenshotUrl}
                    alt={page.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 text-muted-foreground">
                    <FileText className="h-12 w-12 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                  <span className="text-white font-medium flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Page
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" title={page.title}>{page.title}</h3>
                    <p className="text-sm text-muted-foreground truncate" title={`/${page.slug}`}>/{page.slug}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/${workspaceSlug}/pages/${page.id}`)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePreviewPage(page)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      {page.status === 'PUBLISHED' && (
                        <DropdownMenuItem onClick={() => handleViewPublished(page)}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Published
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => handlePublishPage(page.id, page.status)}
                      >
                        {page.status === 'PUBLISHED' ? (
                          <>
                            <GlobeLock className="mr-2 h-4 w-4" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Globe className="mr-2 h-4 w-4" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    {page._count.components} components
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 ${page.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                      }`}
                  >
                    {page.status}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                  Updated {new Date(page.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Page Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Create a new landing page for your marketing campaigns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={newPageTitle}
                onChange={(e) => {
                  setNewPageTitle(e.target.value);
                  if (!newPageSlug || newPageSlug === generateSlug(newPageTitle)) {
                    setNewPageSlug(generateSlug(e.target.value));
                  }
                }}
                placeholder="e.g., Summer Sale Landing Page"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/{workspaceSlug}/</span>
                <Input
                  id="slug"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(generateSlug(e.target.value))}
                  placeholder="summer-sale"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePage} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Create Page Dialog */}
      <Dialog open={isAICreateDialogOpen} onOpenChange={setIsAICreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Create Page with AI
            </DialogTitle>
            <DialogDescription>
              Describe what the page is for and AI will generate a complete design for you.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ai-purpose">What is this page for?</Label>
              <Textarea
                id="ai-purpose"
                value={aiPagePurpose}
                onChange={(e) => setAiPagePurpose(e.target.value)}
                placeholder="e.g., A landing page for our new AI-powered analytics tool that helps businesses track customer behavior and optimize conversions"
                className="mt-2 min-h-[100px]"
                disabled={isAIGenerating}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be specific about the purpose, target audience, and key features.
              </p>
            </div>

            {pages.length > 0 && (
              <div>
                <Label>Design Approach</Label>
                <RadioGroup
                  value={aiDesignMode}
                  onValueChange={(value) => setAiDesignMode(value as 'consistent' | 'new')}
                  disabled={isAIGenerating}
                  className="mt-2"
                >
                  <RadioGroupItem value="consistent">
                    <div>
                      <p className="font-medium text-sm">Design Consistency</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        AI will analyze your existing {pages.length} page{pages.length > 1 ? 's' : ''} and create a design that matches your current style.
                      </p>
                    </div>
                  </RadioGroupItem>
                  <RadioGroupItem value="new">
                    <div>
                      <p className="font-medium text-sm">New Design</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Create a fresh, unique design without matching existing pages.
                      </p>
                    </div>
                  </RadioGroupItem>
                </RadioGroup>
              </div>
            )}

            {(pages.length === 0 || aiDesignMode === 'new') && (
              <div>
                <Label htmlFor="ai-style">Design Style {pages.length > 0 && '(Optional)'}</Label>
                <Input
                  id="ai-style"
                  value={aiDesignStyle}
                  onChange={(e) => setAiDesignStyle(e.target.value)}
                  placeholder="e.g., modern and minimal, bold and colorful, professional corporate"
                  className="mt-2"
                  disabled={isAIGenerating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {pages.length === 0
                    ? 'This is your first page. Describe your preferred design style.'
                    : 'Describe the design style for this new page.'}
                </p>
              </div>
            )}

            {isAIGenerating && (
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-t-transparent mx-auto" />
                <p className="mt-3 text-sm font-medium text-purple-900">Generating your page with AI...</p>
                <p className="text-xs text-purple-700 mt-1">This may take 10-30 seconds</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAICreateDialogOpen(false)}
              disabled={isAIGenerating}
            >
              Cancel
            </Button>
            <Button onClick={handleAICreatePage} disabled={isAIGenerating || !aiPagePurpose}>
              {isAIGenerating ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Page
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
