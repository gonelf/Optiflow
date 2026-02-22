'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { BuilderElement } from '@/types/builder';
import { Button as ButtonPrimitive } from '../primitives/Button';

export interface CraftButtonProps {
    text?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

export function CraftButton({
    text = 'Button',
    variant = 'primary',
    size = 'md',
    disabled = false,
}: CraftButtonProps) {
    const {
        connectors: { connect, drag },
        selected,
        actions: { setProp },
    } = useNode((state) => ({
        selected: state.events.selected,
    }));

    // Convert props to BuilderElement format
    const element: BuilderElement = {
        id: 'craft-button-temp',
        type: 'button',
        name: 'Button',
        pageId: '',
        parentId: null,
        order: 0,
        depth: 0,
        path: '',
        content: {
            text,
            type: 'button',
            disabled,
        },
        styles: {
            base: {
                padding: size === 'sm' ? '0.5rem 1rem' : size === 'lg' ? '1rem 2rem' : '0.75rem 1.5rem',
                fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.125rem' : '1rem',
                backgroundColor: variant === 'primary' ? '#3b82f6' : variant === 'secondary' ? '#6b7280' : 'transparent',
                color: variant === 'outline' ? '#3b82f6' : '#ffffff',
                borderRadius: '0.375rem',
                fontWeight: '500',
            },
        },
        className: variant === 'outline' ? 'border border-blue-500' : '',
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
            <ButtonPrimitive element={element} isBuilder={true} />
        </div>
    );
}

CraftButton.craft = {
    displayName: 'Button',
    props: {
        text: 'Button',
        variant: 'primary',
        size: 'md',
        disabled: false,
    },
    rules: {
        canDrag: () => true,
        canDrop: () => true,
        canMoveIn: () => false,
        canMoveOut: () => true,
    },
    related: {
        settings: () => <div>Button Settings Panel (TODO)</div>,
    },
};
