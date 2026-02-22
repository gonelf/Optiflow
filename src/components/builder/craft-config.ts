// ============================================================================
// CRAFT.JS CONFIGURATION
// ============================================================================

/**
 * This file defines the Craft.js resolver which maps component names to their
 * actual React components. This allows Craft.js to serialize/deserialize the
 * editor state and render the appropriate components.
 */

import { Button } from './primitives/Button';
import { Container } from './primitives/Container';
import { Text } from './primitives/Text';
import { Image } from './primitives/Image';
import { Divider } from './primitives/Divider';
import { Spacer } from './primitives/Spacer';
import { Section } from './primitives/Section';
import { Flexbox } from './primitives/Flexbox';
import { Grid } from './primitives/Grid';
import { Link } from './primitives/Link';
import { List } from './primitives/List';
import { Icon } from './primitives/Icon';
import { RichText } from './primitives/RichText';
import { Video } from './primitives/Video';
import { Embed } from './primitives/Embed';

/**
 * Craft.js resolver - maps component names to components
 */
export const craftResolver = {
    Button,
    Container,
    Text,
    Image,
    Divider,
    Spacer,
    Section,
    Flexbox,
    Grid,
    Link,
    List,
    Icon,
    RichText,
    Video,
    Embed,
};

/**
 * Component metadata for the component palette
 */
export interface ComponentMetadata {
    displayName: string;
    category: 'layout' | 'content' | 'media' | 'interactive';
    icon: string;
    description: string;
}

export const componentMetadata: Record<string, ComponentMetadata> = {
    Button: {
        displayName: 'Button',
        category: 'interactive',
        icon: 'MousePointerClick',
        description: 'Interactive button element',
    },
    Container: {
        displayName: 'Container',
        category: 'layout',
        icon: 'Box',
        description: 'Generic container element',
    },
    Text: {
        displayName: 'Text',
        category: 'content',
        icon: 'Type',
        description: 'Text content',
    },
    Image: {
        displayName: 'Image',
        category: 'media',
        icon: 'ImageIcon',
        description: 'Image element',
    },
    Divider: {
        displayName: 'Divider',
        category: 'layout',
        icon: 'Minus',
        description: 'Horizontal divider',
    },
    Spacer: {
        displayName: 'Spacer',
        category: 'layout',
        icon: 'Space',
        description: 'Spacing element',
    },
    Section: {
        displayName: 'Section',
        category: 'layout',
        icon: 'Square',
        description: 'Section container',
    },
    Flexbox: {
        displayName: 'Flexbox',
        category: 'layout',
        icon: 'LayoutGrid',
        description: 'Flexbox layout',
    },
    Grid: {
        displayName: 'Grid',
        category: 'layout',
        icon: 'Grid3x3',
        description: 'CSS Grid layout',
    },
    Link: {
        displayName: 'Link',
        category: 'interactive',
        icon: 'Link',
        description: 'Hyperlink element',
    },
    List: {
        displayName: 'List',
        category: 'content',
        icon: 'List',
        description: 'List element',
    },
    Icon: {
        displayName: 'Icon',
        category: 'content',
        icon: 'Smile',
        description: 'Icon element',
    },
    RichText: {
        displayName: 'Rich Text',
        category: 'content',
        icon: 'FileText',
        description: 'Rich text editor',
    },
    Video: {
        displayName: 'Video',
        category: 'media',
        icon: 'Video',
        description: 'Video element',
    },
    Embed: {
        displayName: 'Embed',
        category: 'media',
        icon: 'Code',
        description: 'Embedded content',
    },
};
