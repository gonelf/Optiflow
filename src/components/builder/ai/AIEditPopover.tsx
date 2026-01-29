'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Wand2, Loader2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIEditPopoverProps {
    element: any;
    onUpdate: (updates: any) => void;
}

export function AIEditPopover({ element, onUpdate }: AIEditPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleEdit = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/edit-element', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    element,
                    prompt,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to edit element');
            }

            const data = await response.json();
            if (data.success && data.element) {
                onUpdate(data.element);
                toast({
                    title: "Element updated",
                    description: "The element has been modified by AI.",
                });
                setIsOpen(false);
                setPrompt('');
            } else {
                throw new Error('Invalid response from AI');
            }
        } catch (error) {
            console.error('AI Edit Error:', error);
            toast({
                title: "Error",
                description: "Failed to update element. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEdit();
        }
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit with AI">
                    <Wand2 className="h-4 w-4 text-purple-600" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
                <div className="space-y-3">
                    <div className="space-y-1">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                            <Wand2 className="h-3 w-3 text-purple-600" />
                            Edit with AI
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Describe how you want to change this element.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. Make background blue..."
                            className="h-9 text-sm"
                            disabled={isLoading}
                            autoFocus
                        />
                        <Button
                            size="sm"
                            className="h-9 w-9 p-0 shrink-0 bg-purple-600 hover:bg-purple-700"
                            onClick={handleEdit}
                            disabled={isLoading || !prompt.trim()}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
