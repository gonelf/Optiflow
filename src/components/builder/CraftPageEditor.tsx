'use client';

import { useState } from 'react';
import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { EditorSidebar } from '@/components/builder/EditorSidebar';
import { craftResolver } from '@/components/builder/craft-config';
import { BuilderElement } from '@/types/builder';

// Wrapper components that adapt our primitives to Craft.js
import { CraftButton } from './craft-primitives/CraftButton';
import { CraftContainer } from './craft-primitives/CraftContainer';

interface CraftPageEditorProps {
    elements: any[]; // Will be migrated to Craft.js format
    setElements: React.Dispatch<React.SetStateAction<any[]>>;
    selectedElementId: string | null;
    setSelectedElementId: (id: string | null) => void;
    pageId: string;
    mode?: 'default' | 'ab-test';
    toolbar?: React.ReactNode;
    showAI?: boolean;
}

/**
 * Canvas component that receives the Craft.js editor state
 */
function Canvas() {
    const { connectors, actions, query, enabled } = useEditor((state) => ({
        enabled: state.options.enabled,
    }));

    return (
        <div
            ref={(ref) => {
                if (ref) {
                    connectors.select(connectors.hover(ref, ''), '');
                }
            }}
            className="mx-auto max-w-5xl bg-white shadow-lg min-h-screen p-8"
        >
            <Frame>
                <Element is={CraftContainer} canvas>
                    {/* Default content - will be replaced/populated */}
                    <CraftButton />
                </Element>
            </Frame>
        </div>
    );
}

export function CraftPageEditor({
    elements,
    setElements,
    selectedElementId,
    setSelectedElementId,
    pageId,
    mode = 'default',
    toolbar,
    showAI = true,
}: CraftPageEditorProps) {
    const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

    return (
        <Editor
            resolver={{
                ...craftResolver,
                CraftButton,
                CraftContainer,
            }}
            enabled={mode === 'default'} // Enable editing in default mode
            onNodesChange={(query) => {
                // Auto-save changes to state
                const json = query.serialize();
                console.log('Nodes changed:', json);
                // TODO: Convert Craft JSON back to elements format
            }}
        >
            <div className="flex h-full flex-col bg-gray-50">
                {toolbar}
                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 overflow-auto p-8">
                        <Canvas />
                    </div>
                    <EditorSidebar
                        selectedElementId={selectedElementId}
                        elements={elements}
                        onElementUpdate={(id, updates) => {
                            // TODO: Integrate with Craft.js actions
                            console.log('Update element:', id, updates);
                        }}
                        onElementSelect={setSelectedElementId}
                        onAddElement={(element, targetId) => {
                            // TODO: Use Craft.js actions to add element
                            console.log('Add element:', element, targetId);
                        }}
                        setElements={setElements}
                        mode={mode}
                        showAI={showAI}
                    />
                </div>
            </div>
        </Editor>
    );
}
