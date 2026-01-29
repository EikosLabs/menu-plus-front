import { z } from 'zod';

/**
 * Business Schemas - Validation schemas for business/restaurant forms
 * Replaces manual validation in AddBusinessForm.jsx
 */

// Slug validation - only lowercase letters, numbers, and hyphens
const slugSchema = z
  .string()
  .min(1, 'El slug es requerido')
  .min(3, 'El slug debe tener al menos 3 caracteres')
  .max(50, 'El slug no puede exceder 50 caracteres')
  .regex(
    /^[a-z0-9-]+$/,
    'El slug solo puede contener letras minúsculas, números y guiones'
  )
  .refine((val) => !val.startsWith('-') && !val.endsWith('-'), {
    message: 'El slug no puede empezar ni terminar con guión',
  });

// Phone validation - flexible international format
const phoneSchema = z
  .string()
  .regex(
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
    'Por favor ingresa un número de teléfono válido'
  )
  .optional()
  .or(z.literal(''));

// URL validation for social media
const urlSchema = z
  .string()
  .url('Por favor ingresa una URL válida')
  .optional()
  .or(z.literal(''));

// Color validation (hex format)
const colorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color inválido')
  .optional()
  .or(z.literal(''));

/**
 * Create/Edit Business form schema
 */
export const businessSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre del negocio es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  slug: slugSchema,
  
  slogan: z
    .string()
    .max(150, 'El slogan no puede exceder 150 caracteres')
    .optional()
    .or(z.literal('')),
  
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  address: z
    .string()
    .max(200, 'La dirección no puede exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  phoneNumber: phoneSchema,
  
  email: z
    .string()
    .email('Por favor ingresa un email válido')
    .optional()
    .or(z.literal('')),
  
  businessCategoryId: z
    .number()
    .min(1, 'Selecciona una categoría de negocio'),
  
  // Social media
  facebookUrl: urlSchema,
  instagramUrl: urlSchema,
  twitterUrl: urlSchema,
  whatsAppNumber: phoneSchema,
  
  // Styling
  primaryColor: colorSchema,
  secondaryColor: colorSchema,
  accentColor: colorSchema,
  fontFamily: z.string().optional(),
  template: z.number().optional(),
  
  // Currency
  defaultCurrency: z.number().default(0),
  
  // Location
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

/**
 * Business schedule schema
 */
export const scheduleSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  isClosed: z.boolean().default(false),
});

/**
 * Full business with schedules
 */
export const businessWithScheduleSchema = businessSchema.extend({
  schedules: z.array(scheduleSchema).optional(),
});


