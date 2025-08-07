import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, CheckCircle, Clock, AlertTriangle, HelpCircle } from 'lucide-react';
import { Status } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { STATUS_LABELS } from '@/constants';
import { useIsMobile } from '@/hooks/use-mobile';

interface CasesStatusCardProps {
  completedCases: number;
  openCases: number;
}

const CasesStatusCard = ({ 
  completedCases, 
  openCases 
}: CasesStatusCardProps) => {
  const navigate = useNavigate();
  const { caseStatusColors } = useTheme();
  
  // Helper function to get text color based on background
  const getTextColor = (bgColor: string | undefined) => {
    console.log('getTextColor called with:', bgColor);
    if (!bgColor || typeof bgColor !== 'string') {
      console.log('Returning default color due to invalid bgColor');
      return '#1a1a1a'; // Default to dark text
    }
    try {
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
    } catch (error) {
      console.error('Error in getTextColor:', error, 'bgColor:', bgColor);
      return '#1a1a1a';
    }
  };
  const isMobile = useIsMobile();
  
  const navigateToFilteredCases = (status: Status) => {
    navigate('/cases', { state: { statusFilter: status } });
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={isMobile ? 16 : 20} />;
      case 'open':
        return <Clock size={isMobile ? 16 : 20} />;
    }
  };

  const renderStatusBox = (status: Status, count: number) => {
    const bgColor = caseStatusColors?.[status] || '#D3E4FD';
    console.log('renderStatusBox - status:', status, 'bgColor:', bgColor, 'caseStatusColors:', caseStatusColors);
    
    return (
      <div 
        className="rounded-lg p-4 cursor-pointer hover:brightness-95 transition-all"
        style={{ 
          backgroundColor: bgColor,
          color: getTextColor(bgColor)
        }}
        onClick={() => navigateToFilteredCases(status)}
      >
        <div className="flex items-center gap-3">
          <div className={`${isMobile ? "h-8 w-8" : "h-10 w-10"} flex items-center justify-center rounded-full bg-white/20`}>
            {getStatusIcon(status)}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-sm">{STATUS_LABELS[status]}</span>
            <span className="text-xl md:text-2xl font-bold">{count}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-praxis-olive" />
          Status dos Atendimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {renderStatusBox('open', openCases)}
          {renderStatusBox('completed', completedCases)}
        </div>
      </CardContent>
    </Card>
  );
};

export default CasesStatusCard;
