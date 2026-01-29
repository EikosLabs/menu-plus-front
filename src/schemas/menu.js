import { z } from 'zod';

/**
 * Menu Schemas - Validation schemas for menu and menu item forms
 * Replaces manual validation in AddMenuItem.jsx
 */

/**
 * Menu schema
 */
export const menuSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del menú es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  description: z
    .string()
    .max(300, 'La descripción no puede exceder 300 caracteres')
    .optional()
    .or(z.literal('')),
});

/**
 * Section schema
 */
export const sectionSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la sección es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  
  description: z
    .string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  order: z.number().min(0).default(0),
});

/**
 * Menu item schema
 */
export const menuItemSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del producto es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  price: z
    .number({ invalid_type_error: 'El precio debe ser un número' })
    .min(0, 'El precio no puede ser negativo')
    .max(999999.99, 'El precio es demasiado alto'),
  
  currencyType: z.number().default(0),
  
  sectionId: z
    .number()
    .min(1, 'Selecciona una sección'),
  
  menuItemCategoryId: z.number().optional().nullable(),
  
  isAvailable: z.boolean().default(true),
  
  order: z.number().min(0).default(0),
  
  // Image is handled separately via upload
  imageKey: z.string().optional().or(z.literal('')),
});

/**
 * Menu item form schema - for React Hook Form
 * Handles string inputs that need to be converted to numbers
 */
export const menuItemFormSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del plato es obligatorio')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  price: z
    .string()
    .min(1, 'El precio es obligatorio')
    .refine((val) => {
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num > 0;
    }, {
      message: 'El precio debe ser mayor que cero',
    }),
  
  menuItemCategoryId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val === '' || val === null ? null : val),
  
  sectionId: z
    .string()
    .optional()
    .nullable()
    .transform((val) => val === '' || val === null ? null : val),
  
  isAvailable: z.boolean().default(true),
  
  menuId: z.string(),
});

/**
 * Bulk menu items import schema (for AI scanner results)
 */
export const bulkMenuItemsSchema = z.object({
  items: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.number().min(0),
      sectionName: z.string().optional(),
    })
  ),
  sectionId: z.number().optional(),
  createSections: z.boolean().default(true),
});


