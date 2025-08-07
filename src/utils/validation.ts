// Validation utilities for CPF, phone, and other fields
import { logValidationError } from './errorTracking';

/**
 * Validates Brazilian CPF format and check digits
 * @param cpf - CPF string with or without formatting
 * @returns Object with isValid boolean and error message
 */
export function validateCPF(cpf: string, userId?: string): { isValid: boolean; error?: string } {
  if (!cpf) {
    const error = 'CPF é obrigatório';
    logValidationError('cpf', '', error, userId, 'validateCPF');
    return { isValid: false, error };
  }

  // Remove all non-digit characters
  const cpfDigits = cpf.replace(/\D/g, '');

  // Check if has 11 digits
  if (cpfDigits.length !== 11) {
    const error = 'CPF deve conter exatamente 11 dígitos';
    logValidationError('cpf', cpf, error, userId, 'validateCPF');
    return { isValid: false, error };
  }

  // Check for same digit sequence (invalid CPFs)
  if (/^(\d)\1{10}$/.test(cpfDigits)) {
    const error = 'CPF inválido: sequência de dígitos iguais';
    logValidationError('cpf', cpf, error, userId, 'validateCPF');
    return { isValid: false, error };
  }

  // Validate check digits
  let sum = 0;
  let remainder;

  // First check digit
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpfDigits.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfDigits.substring(9, 10))) {
    const error = 'CPF inválido: dígito verificador incorreto';
    logValidationError('cpf', cpf, error, userId, 'validateCPF');
    return { isValid: false, error };
  }

  // Second check digit
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpfDigits.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpfDigits.substring(10, 11))) {
    const error = 'CPF inválido: dígito verificador incorreto';
    logValidationError('cpf', cpf, error, userId, 'validateCPF');
    return { isValid: false, error };
  }

  return { isValid: true };
}

/**
 * Validates Brazilian phone number formats
 * @param phone - Phone string with or without formatting
 * @returns Object with isValid boolean and error message
 */
export function validatePhone(phone: string, userId?: string): { isValid: boolean; error?: string } {
  if (!phone) {
    const error = 'Telefone é obrigatório';
    logValidationError('phone', '', error, userId, 'validatePhone');
    return { isValid: false, error };
  }

  // Remove all non-digit characters
  const phoneDigits = phone.replace(/\D/g, '');

  // Check length (10 for landline, 11 for mobile)
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    const error = 'Telefone deve ter 10 ou 11 dígitos';
    logValidationError('phone', phone, error, userId, 'validatePhone');
    return { isValid: false, error };
  }

  // Check if area code is valid (11 to 99)
  const areaCode = parseInt(phoneDigits.substring(0, 2));
  if (areaCode < 11 || areaCode > 99) {
    const error = 'Código de área inválido (deve estar entre 11 e 99)';
    logValidationError('phone', phone, error, userId, 'validatePhone');
    return { isValid: false, error };
  }

  // For mobile numbers (11 digits), check if first digit after area code is 9
  if (phoneDigits.length === 11) {
    const firstDigit = phoneDigits.charAt(2);
    if (firstDigit !== '9') {
      const error = 'Número de celular deve começar com 9 após o DDD';
      logValidationError('phone', phone, error, userId, 'validatePhone');
      return { isValid: false, error };
    }
  }

  // Check for invalid patterns
  const number = phoneDigits.substring(2);
  if (/^(\d)\1+$/.test(number)) {
    const error = 'Número de telefone inválido: sequência de dígitos iguais';
    logValidationError('phone', phone, error, userId, 'validatePhone');
    return { isValid: false, error };
  }

  return { isValid: true };
}

/**
 * Validates email format
 * @param email - Email string
 * @returns Object with isValid boolean and error message
 */
export function validateEmail(email: string, userId?: string): { isValid: boolean; error?: string } {
  if (!email) {
    const error = 'E-mail é obrigatório';
    logValidationError('email', '', error, userId, 'validateEmail');
    return { isValid: false, error };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const error = 'Formato de e-mail inválido';
    logValidationError('email', email, error, userId, 'validateEmail');
    return { isValid: false, error };
  }

  return { isValid: true };
}

/**
 * Formats CPF for display (xxx.xxx.xxx-xx)
 * @param cpf - CPF string
 * @returns Formatted CPF string
 */
export function formatCPF(cpf: string): string {
  const cpfDigits = cpf.replace(/\D/g, '');
  
  if (cpfDigits.length === 11) {
    return cpfDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
}

/**
 * Formats phone for display ((xx) xxxxx-xxxx or (xx) xxxx-xxxx)
 * @param phone - Phone string
 * @returns Formatted phone string
 */
export function formatPhone(phone: string): string {
  const phoneDigits = phone.replace(/\D/g, '');
  
  if (phoneDigits.length === 11) {
    return phoneDigits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (phoneDigits.length === 10) {
    return phoneDigits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

/**
 * Applies input mask while typing
 * @param value - Current input value
 * @param type - Type of mask (cpf, phone)
 * @returns Masked value
 */
export function applyInputMask(value: string, type: 'cpf' | 'phone'): string {
  const digits = value.replace(/\D/g, '');
  
  if (type === 'cpf') {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  }
  
  if (type === 'phone') {
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  
  return value;
}

/**
 * Validates required fields
 * @param value - Field value
 * @param fieldName - Human readable field name
 * @returns Object with isValid boolean and error message
 */
export function validateRequired(value: string, fieldName: string): { isValid: boolean; error?: string } {
  if (!value || !value.trim()) {
    return { isValid: false, error: `${fieldName} é obrigatório` };
  }
  
  return { isValid: true };
}