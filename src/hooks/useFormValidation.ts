import { useState, useCallback } from 'react';
import { 
  validateCPF, 
  validatePhone, 
  validateEmail, 
  validateRequired 
} from '@/utils/validation';

interface ValidationRule {
  validator: (value: string, ...args: any[]) => { isValid: boolean; error?: string };
  args?: any[];
}

interface ValidationSchema {
  [key: string]: ValidationRule[];
}

export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validationSchema: ValidationSchema
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((fieldName: string, value: string) => {
    const rules = validationSchema[fieldName];
    if (!rules) return { isValid: true };

    for (const rule of rules) {
      const result = rule.validator(value, ...(rule.args || []));
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  }, [validationSchema]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};
    let isFormValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const value = data[fieldName]?.toString() || '';
      const result = validateField(fieldName, value);
      
      if (!result.isValid) {
        newErrors[fieldName] = result.error!;
        isFormValid = false;
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [data, validateField, validationSchema]);

  const updateField = useCallback((fieldName: string, value: any) => {
    setData(prev => ({ ...prev, [fieldName]: value }));
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Clear error when field is updated
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [errors]);

  const getFieldError = useCallback((fieldName: string) => {
    return touched[fieldName] ? errors[fieldName] : undefined;
  }, [errors, touched]);

  const isFieldValid = useCallback((fieldName: string) => {
    return touched[fieldName] && !errors[fieldName] && data[fieldName];
  }, [errors, touched, data]);

  const resetForm = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  return {
    data,
    errors,
    touched,
    updateField,
    validateForm,
    getFieldError,
    isFieldValid,
    resetForm,
    setData
  };
}

// Common validation schemas
export const clientFormValidationSchema: ValidationSchema = {
  name: [{ validator: validateRequired, args: ['Nome'] }],
  category: [{ validator: validateRequired, args: ['Categoria'] }],
  cpf: [{ validator: validateCPF }],
  phone: [{ validator: validatePhone }],
  email: [{ validator: validateEmail }]
};

export const clientEditValidationSchema: ValidationSchema = {
  name: [{ validator: validateRequired, args: ['Nome'] }],
  cpf: [
    { validator: validateRequired, args: ['CPF'] },
    { validator: validateCPF }
  ],
  category: [{ validator: validateRequired, args: ['Categoria'] }],
  phone: [{ validator: validatePhone }],
  email: [{ validator: validateEmail }]
};