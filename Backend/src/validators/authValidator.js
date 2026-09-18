/**
 * ==============================================================================
 * Authentication Request Validators (express-validator)
 * ==============================================================================
 * Validates and sanitizes incoming request bodies for authentication operations
 * before reaching the controllers. Protects against malformed data, injection,
 * and weak passwords.
 */

import { body, param } from 'express-validator';

/**
 * Validation rules for Customer Self-Registration
 */
export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),

  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/)
    .withMessage('Please provide a valid phone number format'),
];

/**
 * Validation rules for User Login (Customer & Admin)
 */
export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
];

/**
 * Validation rules for Forgot Password link request
 */
export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
];

/**
 * Validation rules for Password Reset using Token
 */
export const resetPasswordValidator = [
  param('token')
    .trim()
    .notEmpty()
    .withMessage('Reset token is required'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number'),
];

/**
 * Validation rules for Super Admin creating an Admin account
 */
export const createAdminValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Staff name is required')
    .isLength({ min: 2, max: 100 }),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Official staff email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Temporary password is required')
    .isLength({ min: 8 })
    .withMessage('Temporary password must be at least 8 characters long'),

  body('role')
    .optional()
    .isIn(['ADMIN', 'SUPER_ADMIN'])
    .withMessage('Role must be either ADMIN or SUPER_ADMIN'),
];
