'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { BuilderElement } from '@/types/builder';
import { Container as ContainerPrimitive } from '../primitives/Container';

export interface CraftContainerProps {
    children?: React.ReactNode;
    tag?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer';
    padding?: string;
    background?: string;
}

export function CraftContainer({
    children,
    tag = 'div',
    padding = '1rem',
    background = 'transparent',
}: CraftContainerProps) {
    const {
        connectors: { connect, drag },
        selected,
    } = useNode((state) => ({
        selected: state.events.selected,
    }));

    // Convert props to BuilderElement format
    const element: BuilderElement = {
        id: 'craft-container-temp',
        type: 'container',
        name: 'Container',
        pageId: '',
        parentId: null,
        order: 0,
        depth: 0,
        path: '',
        content: {
            tag,
        },
        styles: {
            base: {
                padding,
                backgroundColor: background,
                minHeight: '100px',
                width: '100%',
            },
        },
        className: '',
        attributes: {},
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    return (
        <div
            ref={(ref) => {
                if (ref) {
                    connect(drag(ref));
                }
            }}
            className={selected ? 'ring-2 ring-blue-500' : ''}
        >
            <ContainerPrimitive element={element} isBuilder={true}>
                {children}
            </ContainerPrimitive>
        </div>
    );
}

CraftContainer.craft = {
    displayName: 'Container',
    props: {
        tag: 'div',
        padding: '1rem',
        background: 'transparent',
    },
    rules: {
        canDrag: () => true,
        canDrop: () => true,
        canMoveIn: () => true, // Containers can accept children
        canMoveOut: () => true,
    },
    related: {
        settings: () => <div>Container Settings Panel (TODO)</div>,
    },
};
