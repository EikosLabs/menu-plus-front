import { z } from 'zod';

/**
 * Auth Schemas - Validation schemas for authentication forms
 * These replace manual validation logic in LoginForm, RegisterForm, etc.
 */

// Common email validation
const emailSchema = z
  .string()
  .min(1, 'El email es requerido')
  .email('Por favor ingresa un email válido');

// Common password validation
const passwordSchema = z
  .string()
  .min(1, 'La contraseña es requerida')
  .min(6, 'La contraseña debe tener al menos 6 caracteres');

// Strong password for registration
const strongPasswordSchema = z
  .string()
  .min(1, 'La contraseña es requerida')
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número');

/**
 * Login form schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Registration form schema
 */
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'El nombre completo es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100, 'El nombre no puede exceder 100 caracteres'),
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Debes aceptar los términos y condiciones',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

/**
 * Magic link request schema
 */
export const magicLinkSchema = z.object({
  email: emailSchema,
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
});

/**
 * Password reset request schema
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

/**
 * Password reset schema (with new password)
 */
export const passwordResetSchema = z
  .object({
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });


