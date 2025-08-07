
import React from 'react';
import { CaseStatus, TaskStatus } from '@/types';
import { CASE_STATUS_LABELS, TASK_STATUS_LABELS } from '@/constants';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/context/ThemeContext';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CaseStatus | TaskStatus;
  useCustomization?: boolean;
  className?: string;
}

export const StatusBadge = ({ status, useCustomization = false, className }: StatusBadgeProps) => {
  const { caseStatusColors, taskStatusColors } = useTheme();
  
  // Determinar se é status de task ou case
  const isTaskStatus = ['in-progress', 'delayed'].includes(status as string);
  const labels = isTaskStatus ? TASK_STATUS_LABELS : CASE_STATUS_LABELS;
  
  // Helper function to get text color based on background
  const getTextColor = (bgColor: string) => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  };
  
  if (useCustomization) {
    const bgColor = isTaskStatus 
      ? taskStatusColors[status as TaskStatus] 
      : caseStatusColors[status as CaseStatus];
      
    const textColor = getTextColor(bgColor);
      
    return (
      <Badge 
        className={className}
        style={{ 
          backgroundColor: bgColor,
          color: textColor
        }}
      >
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  }
  
  // Default style from constants
  return (
    <Badge className={cn(
      status === 'completed' ? 'bg-green-100 text-green-800' : 
      status === 'delayed' ? 'bg-red-100 text-red-800' :
      'bg-blue-100 text-blue-800',
      className
    )}>
      {labels[status as keyof typeof labels]}
    </Badge>
  );
};
