/**
 * Brochure Editor Types
 * Types for the PDF brochure editor with drag & drop functionality
 */

export type PageFormat = 'A4' | 'Letter';

export interface PageDimensions {
  width: number;
  height: number;
  unit: 'mm' | 'in';
}

export const PAGE_FORMATS: Record<PageFormat, PageDimensions> = {
  A4: { width: 210, height: 297, unit: 'mm' },
  Letter: { width: 216, height: 279, unit: 'mm' }
};

export type TemplateStyle = 'classic' | 'modern' | 'minimal' | 'elegant';

export interface TemplateConfig {
  id: TemplateStyle;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    price: string;
  };
  layout: {
    columns: 1 | 2 | 3;
    spacing: 'compact' | 'normal' | 'spacious';
    showImages: boolean;
    showPrices: boolean;
    showDescriptions: boolean;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  imageUri?: string;
  isAvailable?: boolean;
  order?: number;
}

export interface MenuSection {
  id: string;
  name: string;
  description?: string;
  order: number;
  menuItems: MenuItem[];
}

export interface Menu {
  id: string;
  name: string;
  description?: string;
  sections: MenuSection[];
  uncategorizedItems?: MenuItem[];
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  logoUri?: string;
  heroImageUri?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}

export interface BrochureElement {
  id: string;
  type: 'menu' | 'section' | 'item' | 'text' | 'image';
  data: Menu | MenuSection | MenuItem | { text: string } | { imageUri: string };
  order: number;
}

export interface BrochureConfig {
  business: Business;
  elements: BrochureElement[];
  template: TemplateStyle;
  pageFormat: PageFormat;
  title?: string;
  subtitle?: string;
  footer?: string;
}

export interface BrochureEditorState {
  config: BrochureConfig;
  availableMenus: Menu[];
  selectedTemplate: TemplateStyle;
  selectedFormat: PageFormat;
  isGenerating: boolean;
  previewMode: boolean;
}
