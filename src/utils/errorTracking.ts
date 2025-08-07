// Error tracking and logging utilities for validation and user experience monitoring

interface ValidationError {
  field: string;
  value: string;
  error: string;
  timestamp: Date;
  userId?: string;
  context?: string;
}

interface UserActionLog {
  action: string;
  details: Record<string, any>;
  timestamp: Date;
  userId?: string;
  success: boolean;
  errorMessage?: string;
}

class ErrorTracker {
  private validationErrors: ValidationError[] = [];
  private userActionLogs: UserActionLog[] = [];
  private maxLogSize = 100; // Keep last 100 entries in memory

  /**
   * Logs a validation error
   */
  logValidationError(
    field: string, 
    value: string, 
    error: string, 
    userId?: string, 
    context?: string
  ): void {
    const validationError: ValidationError = {
      field,
      value: this.sanitizeValue(value),
      error,
      timestamp: new Date(),
      userId,
      context
    };

    this.validationErrors.push(validationError);
    this.trimLogArray(this.validationErrors);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Validation Error:', validationError);
    }

    // Send to analytics in production (if configured)
    this.sendToAnalytics('validation_error', validationError);
  }

  /**
   * Logs a user action (success or failure)
   */
  logUserAction(
    action: string,
    details: Record<string, any>,
    success: boolean,
    userId?: string,
    errorMessage?: string
  ): void {
    const actionLog: UserActionLog = {
      action,
      details: this.sanitizeDetails(details),
      timestamp: new Date(),
      userId,
      success,
      errorMessage
    };

    this.userActionLogs.push(actionLog);
    this.trimLogArray(this.userActionLogs);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('User Action:', actionLog);
    }

    // Send to analytics
    this.sendToAnalytics('user_action', actionLog);
  }

  /**
   * Gets validation error statistics
   */
  getValidationStats(): Record<string, any> {
    const stats = {
      totalErrors: this.validationErrors.length,
      errorsByField: {} as Record<string, number>,
      errorsByType: {} as Record<string, number>,
      recentErrors: this.validationErrors.slice(-10)
    };

    this.validationErrors.forEach(error => {
      // Count by field
      stats.errorsByField[error.field] = (stats.errorsByField[error.field] || 0) + 1;
      
      // Count by error type
      stats.errorsByType[error.error] = (stats.errorsByType[error.error] || 0) + 1;
    });

    return stats;
  }

  /**
   * Gets user action statistics
   */
  getUserActionStats(): Record<string, any> {
    const stats = {
      totalActions: this.userActionLogs.length,
      successRate: 0,
      actionsByType: {} as Record<string, { total: number; success: number; failure: number }>,
      recentActions: this.userActionLogs.slice(-10)
    };

    let successCount = 0;

    this.userActionLogs.forEach(log => {
      if (log.success) successCount++;

      // Count by action type
      if (!stats.actionsByType[log.action]) {
        stats.actionsByType[log.action] = { total: 0, success: 0, failure: 0 };
      }
      
      stats.actionsByType[log.action].total++;
      if (log.success) {
        stats.actionsByType[log.action].success++;
      } else {
        stats.actionsByType[log.action].failure++;
      }
    });

    stats.successRate = this.userActionLogs.length > 0 
      ? (successCount / this.userActionLogs.length) * 100 
      : 0;

    return stats;
  }

  /**
   * Exports logs for analysis
   */
  exportLogs(): string {
    return JSON.stringify({
      validationErrors: this.validationErrors,
      userActionLogs: this.userActionLogs,
      exportedAt: new Date(),
      stats: {
        validation: this.getValidationStats(),
        userActions: this.getUserActionStats()
      }
    }, null, 2);
  }

  /**
   * Clears all logs
   */
  clearLogs(): void {
    this.validationErrors = [];
    this.userActionLogs = [];
  }

  private sanitizeValue(value: string): string {
    // Remove sensitive information but keep format for analysis
    if (value.length === 11 && /^\d+$/.test(value)) {
      // Looks like CPF - mask it
      return `***.***.***-${value.slice(-2)}`;
    }
    
    if (value.includes('@')) {
      // Email - mask it
      const [local, domain] = value.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    }
    
    if (value.length >= 10 && /^\d+$/.test(value.replace(/\D/g, ''))) {
      // Phone - mask it
      return `(${value.slice(0, 2)}) ****-${value.slice(-4)}`;
    }
    
    return value.length > 50 ? `${value.slice(0, 50)}...` : value;
  }

  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};
    
    Object.keys(details).forEach(key => {
      const value = details[key];
      
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeValue(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeDetails(value);
      } else {
        sanitized[key] = value;
      }
    });
    
    return sanitized;
  }

  private trimLogArray<T>(arr: T[]): void {
    if (arr.length > this.maxLogSize) {
      arr.splice(0, arr.length - this.maxLogSize);
    }
  }

  private sendToAnalytics(eventType: string, data: any): void {
    // In a real application, you would send this to your analytics service
    // For now, we'll just store it locally
    try {
      const analyticsData = {
        eventType,
        data,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Could integrate with services like Google Analytics, Mixpanel, etc.
      // analytics.track(eventType, analyticsData);
      
      console.debug('Analytics Event:', analyticsData);
    } catch (error) {
      console.error('Error sending analytics data:', error);
    }
  }
}

// Global instance
export const errorTracker = new ErrorTracker();

// Convenience functions
export function logValidationError(
  field: string, 
  value: string, 
  error: string, 
  userId?: string, 
  context?: string
): void {
  errorTracker.logValidationError(field, value, error, userId, context);
}

export function logUserAction(
  action: string,
  details: Record<string, any>,
  success: boolean,
  userId?: string,
  errorMessage?: string
): void {
  errorTracker.logUserAction(action, details, success, userId, errorMessage);
}

export function getErrorStats(): Record<string, any> {
  return {
    validation: errorTracker.getValidationStats(),
    userActions: errorTracker.getUserActionStats()
  };
}

export function exportErrorLogs(): string {
  return errorTracker.exportLogs();
}
