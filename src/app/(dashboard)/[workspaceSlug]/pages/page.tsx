'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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

interface Page {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  updatedAt: string;
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
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageSlug, setNewPageSlug] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const workspaceSlug = params.workspaceSlug as string;

  const fetchPages = useCallback(async () => {
    try {
      setIsLoading(true);

      // Get workspace ID first
      const workspaceResponse = await fetch(`/api/workspaces?slug=${workspaceSlug}`);
      if (!workspaceResponse.ok) throw new Error('Failed to fetch workspace');

      const workspaceData = await workspaceResponse.json();
      const workspaceId = workspaceData.workspace.id;

      // Fetch pages
      const response = await fetch(`/api/pages?workspaceId=${workspaceId}`);
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
  }, [workspaceSlug, toast]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleCreatePage = async () => {
    if (!newPageTitle || !newPageSlug) {
      toast({
        title: 'Error',
        description: 'Please provide a title and slug for the page.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsCreating(true);

      // Get workspace ID
      const workspaceResponse = await fetch(`/api/workspaces?slug=${workspaceSlug}`);
      if (!workspaceResponse.ok) throw new Error('Failed to fetch workspace');

      const workspaceData = await workspaceResponse.json();
      const workspaceId = workspaceData.workspace.id;

      // Create page
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workspaceId,
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
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
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
            <Card key={page.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{page.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">/{page.slug}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
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

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {page._count.components} components
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    page.status === 'PUBLISHED'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {page.status}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(page.updatedAt).toLocaleDateString()}
                </p>
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
    </div>
  );
}
