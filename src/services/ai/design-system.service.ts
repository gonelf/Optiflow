/**
 * Design System Service
 * Integrates UI/UX Pro Max skill for intelligent design system generation
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export interface DesignSystemColors {
  primary: string;
  secondary: string;
  cta: string;
  background: string;
  text: string;
  notes?: string;
}

export interface DesignSystemTypography {
  heading: string;
  body: string;
  mood: string[];
  bestFor: string;
  googleFontsUrl?: string;
  cssImport?: string;
}

export interface DesignSystemPattern {
  name: string;
  description: string;
  cta: string;
  sections: string[];
}

export interface DesignSystemStyle {
  name: string;
  keywords: string[];
  bestFor: string[];
  performance: string;
  accessibility: string;
}

export interface DesignSystem {
  projectName: string;
  pattern: DesignSystemPattern;
  style: DesignSystemStyle;
  colors: DesignSystemColors;
  typography: DesignSystemTypography;
  keyEffects: string[];
  antiPatterns: string[];
  checklist: string[];
  rawOutput?: string;
}

export class DesignSystemService {
  private static skillPath = path.join(
    process.cwd(),
    '.claude/skills/ui-ux-pro-max/scripts/search.py'
  );

  /**
   * Generate a design system for a specific project type
   */
  static async generateDesignSystem(
    projectDescription: string,
    projectName: string = 'Project',
    industry?: string
  ): Promise<DesignSystem> {
    try {
      // Build search query
      const query = industry
        ? `${industry} ${projectDescription}`
        : projectDescription;

      // Execute the Python script
      const command = `python3 "${this.skillPath}" "${query}" --design-system -p "${projectName}"`;

      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000, // 30 second timeout
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      if (stderr && !stderr.includes('warning')) {
        console.warn('Design system generation warning:', stderr);
      }

      // Parse the output
      const designSystem = this.parseDesignSystemOutput(stdout, projectName);

      return designSystem;
    } catch (error) {
      console.error('Failed to generate design system:', error);
      // Return a fallback design system
      return this.getFallbackDesignSystem(projectName);
    }
  }

  /**
   * Generate design system with persistence (creates design-system/MASTER.md)
   */
  static async generateAndPersistDesignSystem(
    projectDescription: string,
    projectName: string = 'Project',
    industry?: string
  ): Promise<DesignSystem> {
    try {
      const query = industry
        ? `${industry} ${projectDescription}`
        : projectDescription;

      const command = `python3 "${this.skillPath}" "${query}" --design-system --persist -p "${projectName}"`;

      const { stdout, stderr } = await execAsync(command, {
        timeout: 30000,
        maxBuffer: 1024 * 1024 * 10,
      });

      if (stderr && !stderr.includes('warning')) {
        console.warn('Design system generation warning:', stderr);
      }

      const designSystem = this.parseDesignSystemOutput(stdout, projectName);

      return designSystem;
    } catch (error) {
      console.error('Failed to generate and persist design system:', error);
      return this.getFallbackDesignSystem(projectName);
    }
  }

  /**
   * Search specific domains (style, color, typography, product, etc.)
   */
  static async searchDomain(
    query: string,
    domain: 'style' | 'color' | 'typography' | 'product' | 'chart' | 'ux' | 'landing'
  ): Promise<string> {
    try {
      const command = `python3 "${this.skillPath}" "${query}" --domain ${domain}`;

      const { stdout } = await execAsync(command, {
        timeout: 15000,
        maxBuffer: 1024 * 1024 * 5,
      });

      return stdout;
    } catch (error) {
      console.error(`Failed to search ${domain} domain:`, error);
      return '';
    }
  }

  /**
   * Parse the design system output from Python script
   */
  private static parseDesignSystemOutput(
    output: string,
    projectName: string
  ): DesignSystem {
    // Clean lines - remove table borders and excessive whitespace
    const lines = output
      .split('\n')
      .map(line => {
        // Remove table border characters and trim
        return line
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .trim();
      })
      .filter(line => line.length > 0 && !line.match(/^[+\-]+$/));

    // Initialize design system object
    const designSystem: DesignSystem = {
      projectName,
      pattern: {
        name: '',
        description: '',
        cta: '',
        sections: [],
      },
      style: {
        name: '',
        keywords: [],
        bestFor: [],
        performance: '',
        accessibility: '',
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        cta: '#F59E0B',
        background: '#FFFFFF',
        text: '#1F2937',
      },
      typography: {
        heading: 'Inter',
        body: 'Inter',
        mood: ['modern', 'clean'],
        bestFor: 'General purpose',
      },
      keyEffects: [],
      antiPatterns: [],
      checklist: [],
      rawOutput: output,
    };

    let currentSection = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Pattern section
      if (line.startsWith('PATTERN:')) {
        designSystem.pattern.name = line.replace('PATTERN:', '').trim();
        currentSection = 'pattern';
      } else if (currentSection === 'pattern' && line.includes('Conversion:')) {
        designSystem.pattern.description = line.replace('Conversion:', '').trim();
      } else if (currentSection === 'pattern' && line.includes('CTA:')) {
        designSystem.pattern.cta = line.replace('CTA:', '').trim();
      } else if (currentSection === 'pattern' && line.includes('Sections:')) {
        // Next line contains sections
        const sectionsLine = lines[i + 1] || '';
        designSystem.pattern.sections = sectionsLine.split(/\d+\./).filter(s => s.trim()).map(s => s.trim());
      }

      // Style section
      if (line.startsWith('STYLE:')) {
        designSystem.style.name = line.replace('STYLE:', '').trim();
        currentSection = 'style';
      } else if (currentSection === 'style' && line.includes('Keywords:')) {
        designSystem.style.keywords = line
          .replace('Keywords:', '')
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0);
      } else if (currentSection === 'style' && line.includes('Best For:')) {
        designSystem.style.bestFor = line
          .replace('Best For:', '')
          .split(',')
          .map(b => b.trim())
          .filter(b => b.length > 0);
      } else if (currentSection === 'style' && line.includes('Performance:')) {
        const match = line.match(/Performance:\s*([^|]+)/);
        if (match) designSystem.style.performance = match[1].trim();
      } else if (currentSection === 'style' && line.includes('Accessibility:')) {
        const match = line.match(/Accessibility:\s*(.+)/);
        if (match) designSystem.style.accessibility = match[1].trim();
      }

      // Colors section
      if (line.startsWith('COLORS:')) {
        currentSection = 'colors';
      } else if (currentSection === 'colors') {
        if (line.includes('Primary:')) {
          designSystem.colors.primary = this.extractColorValue(line);
        } else if (line.includes('Secondary:')) {
          designSystem.colors.secondary = this.extractColorValue(line);
        } else if (line.includes('CTA:')) {
          designSystem.colors.cta = this.extractColorValue(line);
        } else if (line.includes('Background:')) {
          designSystem.colors.background = this.extractColorValue(line);
        } else if (line.includes('Text:')) {
          designSystem.colors.text = this.extractColorValue(line);
        } else if (line.includes('Notes:')) {
          designSystem.colors.notes = line.replace(/.*Notes:/, '').trim();
        }
      }

      // Typography section
      if (line.startsWith('TYPOGRAPHY:')) {
        const fonts = line.replace('TYPOGRAPHY:', '').trim().split('/').map(f => f.trim());
        designSystem.typography.heading = fonts[0] || 'Inter';
        designSystem.typography.body = fonts[1] || fonts[0] || 'Inter';
        currentSection = 'typography';
      } else if (currentSection === 'typography') {
        if (line.includes('Mood:')) {
          designSystem.typography.mood = line
            .replace(/.*Mood:/, '')
            .split(',')
            .map(m => m.trim())
            .filter(m => m.length > 0);
        } else if (line.includes('Best For:')) {
          designSystem.typography.bestFor = line.replace(/.*Best For:/, '').trim();
        } else if (line.includes('Google Fonts:')) {
          designSystem.typography.googleFontsUrl = line.replace(/.*Google Fonts:/, '').trim();
        } else if (line.includes('CSS Import:')) {
          designSystem.typography.cssImport = line.replace(/.*CSS Import:/, '').trim();
        }
      }

      // Key Effects
      if (line.startsWith('KEY EFFECTS:')) {
        currentSection = 'effects';
      } else if (currentSection === 'effects' && line && !line.startsWith('AVOID')) {
        if (line.trim().length > 0) {
          designSystem.keyEffects.push(line.trim());
        }
      }

      // Anti-patterns
      if (line.includes('AVOID') && line.includes('Anti-patterns')) {
        currentSection = 'antipatterns';
      } else if (currentSection === 'antipatterns' && line && !line.includes('PRE-DELIVERY')) {
        if (line.trim().length > 0) {
          designSystem.antiPatterns.push(line.trim());
        }
      }

      // Checklist
      if (line.includes('PRE-DELIVERY CHECKLIST:')) {
        currentSection = 'checklist';
      } else if (currentSection === 'checklist' && line.includes('[')) {
        designSystem.checklist.push(line.trim());
      }
    }

    return designSystem;
  }

  /**
   * Extract color value from a line
   */
  private static extractColorValue(line: string): string {
    const match = line.match(/#[0-9A-Fa-f]{6}/);
    return match ? match[0] : '#000000';
  }

  /**
   * Get a fallback design system when generation fails
   */
  private static getFallbackDesignSystem(projectName: string): DesignSystem {
    return {
      projectName,
      pattern: {
        name: 'Modern Landing Page',
        description: 'Clean, conversion-focused layout with clear value proposition',
        cta: 'Above fold + section CTAs',
        sections: ['Hero', 'Features', 'Social Proof', 'CTA'],
      },
      style: {
        name: 'Modern Professional',
        keywords: ['clean', 'minimal', 'professional'],
        bestFor: ['SaaS', 'B2B', 'web apps'],
        performance: 'Good',
        accessibility: 'WCAG AA',
      },
      colors: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        cta: '#F59E0B',
        background: '#FFFFFF',
        text: '#1F2937',
        notes: 'Modern blue palette with warm CTA',
      },
      typography: {
        heading: 'Inter',
        body: 'Inter',
        mood: ['modern', 'clean', 'professional'],
        bestFor: 'SaaS and web applications',
        googleFontsUrl: 'https://fonts.google.com/specimen/Inter',
      },
      keyEffects: [
        'Smooth scroll animations',
        'Hover state transitions',
        'Card shadows',
      ],
      antiPatterns: [
        'Avoid cluttered layouts',
        'Avoid poor contrast',
      ],
      checklist: [
        'Accessible color contrast',
        'Responsive breakpoints',
        'Focus states',
        'Loading states',
      ],
    };
  }

  /**
   * Convert design system to a prompt-friendly format
   */
  static designSystemToPrompt(designSystem: DesignSystem): string {
    return `
DESIGN SYSTEM FOR ${designSystem.projectName}:

PATTERN: ${designSystem.pattern.name}
${designSystem.pattern.description}
CTA Strategy: ${designSystem.pattern.cta}
Sections: ${designSystem.pattern.sections.join(', ')}

STYLE: ${designSystem.style.name}
Best For: ${designSystem.style.bestFor.join(', ')}
Performance: ${designSystem.style.performance}
Accessibility: ${designSystem.style.accessibility}

COLORS:
- Primary: ${designSystem.colors.primary}
- Secondary: ${designSystem.colors.secondary}
- CTA: ${designSystem.colors.cta}
- Background: ${designSystem.colors.background}
- Text: ${designSystem.colors.text}
${designSystem.colors.notes ? `- Notes: ${designSystem.colors.notes}` : ''}

TYPOGRAPHY:
- Heading Font: ${designSystem.typography.heading}
- Body Font: ${designSystem.typography.body}
- Mood: ${designSystem.typography.mood.join(', ')}
- Best For: ${designSystem.typography.bestFor}

KEY EFFECTS TO IMPLEMENT:
${designSystem.keyEffects.map(effect => `- ${effect}`).join('\n')}

AVOID THESE ANTI-PATTERNS:
${designSystem.antiPatterns.map(pattern => `- ${pattern}`).join('\n')}

CHECKLIST REQUIREMENTS:
${designSystem.checklist.map(item => `${item}`).join('\n')}
`;
  }
}
