/**
 * Convert a style object to a CSS string.
 * Example: { backgroundColor: 'red', fontSize: '16px' } -> "background-color: red; font-size: 16px;"
 */
export function styleObjectToString(styles: Record<string, string | number>): string {
    if (!styles) return '';
    return Object.entries(styles)
        .map(([key, value]) => {
            const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
            return `${kebabKey}: ${value};`;
        })
        .join(' ');
}

/**
 * Convert a CSS string to a style object.
 * Example: "background-color: red; font-size: 16px;" -> { backgroundColor: 'red', fontSize: '16px' }
 */
export function stringToStyleObject(css: string): Record<string, string> {
    if (!css) return {};
    const styles: Record<string, string> = {};
    css.split(';').forEach((style) => {
        const [key, value] = style.split(':');
        if (key && value) {
            const camelKey = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            styles[camelKey] = value.trim();
        }
    });
    return styles;
}
