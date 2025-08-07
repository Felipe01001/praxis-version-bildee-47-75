import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { applyInputMask } from '@/utils/validation';

interface InputWithValidationProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  mask?: 'cpf' | 'phone';
  helpText?: string;
  onValueChange?: (value: string) => void;
}

export const InputWithValidation = React.forwardRef<HTMLInputElement, InputWithValidationProps>(
  ({ 
    label, 
    error, 
    success, 
    required, 
    mask, 
    helpText, 
    onValueChange,
    onChange,
    className,
    ...props 
  }, ref) => {
    const [focused, setFocused] = useState(false);
    const [maskedValue, setMaskedValue] = useState(props.value?.toString() || '');

    useEffect(() => {
      if (props.value !== undefined) {
        const newValue = props.value.toString();
        setMaskedValue(mask ? applyInputMask(newValue, mask) : newValue);
      }
    }, [props.value, mask]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      if (mask) {
        value = applyInputMask(value, mask);
        setMaskedValue(value);
        
        // Pass the raw value (digits only) to parent
        const rawValue = value.replace(/\D/g, '');
        onValueChange?.(rawValue);
        
        // Create a new event with the masked value for form compatibility
        const maskedEvent = {
          ...e,
          target: {
            ...e.target,
            value: value
          }
        };
        onChange?.(maskedEvent);
      } else {
        setMaskedValue(value);
        onValueChange?.(value);
        onChange?.(e);
      }
    };

    const inputClassName = cn(
      "transition-all duration-200",
      error && "border-destructive focus-visible:ring-destructive",
      success && "border-green-500 focus-visible:ring-green-500",
      focused && !error && !success && "border-primary focus-visible:ring-primary",
      className
    );

    return (
      <div className="space-y-2">
        <label htmlFor={props.id} className="text-sm font-medium flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </label>
        
        <div className="relative">
          <Input
            {...props}
            ref={ref}
            value={mask ? maskedValue : props.value}
            onChange={handleChange}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            className={inputClassName}
          />
          
          {/* Status icon */}
          {(error || success) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {error && <AlertCircle className="h-4 w-4 text-destructive" />}
              {success && <CheckCircle className="h-4 w-4 text-green-500" />}
            </div>
          )}
        </div>
        
        {/* Error message */}
        {error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        
        {/* Help text */}
        {helpText && !error && (
          <p className="text-xs text-muted-foreground">{helpText}</p>
        )}
      </div>
    );
  }
);

InputWithValidation.displayName = "InputWithValidation";