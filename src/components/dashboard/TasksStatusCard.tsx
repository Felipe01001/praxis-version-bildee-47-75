import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { TaskStatus } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { TASK_STATUS_LABELS } from '@/constants';
import { useIsMobile } from '@/hooks/use-mobile';

interface TasksStatusCardProps {
  completedTasks: number;
  openTasks: number;
  delayedTasks: number;
}

const TasksStatusCard = ({ 
  completedTasks, 
  openTasks,
  delayedTasks 
}: TasksStatusCardProps) => {
  const navigate = useNavigate();
  const { taskStatusColors } = useTheme();
  
  // Helper function to get text color based on background
  const getTextColor = (bgColor: string) => {
    if (!bgColor) return '#1a1a1a'; // Default to dark text
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  };
  const isMobile = useIsMobile();
  
  const navigateToFilteredTasks = (status: TaskStatus) => {
    navigate('/tasks', { state: { statusFilter: status } });
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={isMobile ? 16 : 20} />;
      case 'in-progress':
        return <Clock size={isMobile ? 16 : 20} />;
      case 'delayed':
        return <AlertTriangle size={isMobile ? 16 : 20} />;
    }
  };

  const renderStatusBox = (status: TaskStatus, count: number) => {
    return (
      <div 
        className="rounded-lg p-4 cursor-pointer hover:brightness-95 transition-all"
        style={{ 
          backgroundColor: taskStatusColors[status] || '#D3E4FD',
          color: getTextColor(taskStatusColors[status] || '#D3E4FD')
        }}
        onClick={() => navigateToFilteredTasks(status)}
      >
        <div className="flex items-center gap-3">
          <div className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} flex items-center justify-center rounded-full bg-white/20`}>
            {getStatusIcon(status)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{TASK_STATUS_LABELS[status]}</span>
            <span className="text-xl md:text-2xl font-bold">{count}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-praxis-olive" />
          Status das Tarefas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderStatusBox('in-progress', openTasks)}
          {renderStatusBox('delayed', delayedTasks)}
          {renderStatusBox('completed', completedTasks)}
        </div>
      </CardContent>
    </Card>
  );
};

export default TasksStatusCard;