
import { Case } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Edit, Trash2, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABELS, SUBCATEGORIES } from '@/constants';

interface CaseCardProps {
  case: Case;
  onEdit: (caseItem: Case) => void;
  onDelete: (id: string) => void;
  onUpdateStatus?: (caseItem: Case, newStatus: 'open' | 'completed') => void;
}

export const CaseCard = ({ case: caseItem, onEdit, onDelete, onUpdateStatus }: CaseCardProps) => {
  const navigate = useNavigate();
  
  // Get translated labels
  const categoryLabel = CATEGORY_LABELS[caseItem.category] || caseItem.category;
  const subCategoryLabel = caseItem.subCategory ? 
    SUBCATEGORIES[caseItem.category]?.find(sub => sub.value === caseItem.subCategory)?.label || caseItem.subCategory 
    : null;

  const handleCardClick = () => {
    navigate(`/cases/${caseItem.id}/timeline`);
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateStatus) {
      const newStatus = caseItem.status === 'open' ? 'completed' : 'open';
      onUpdateStatus(caseItem, newStatus);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(caseItem);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(caseItem.id);
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleCardClick}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {categoryLabel}
        </CardTitle>
        <StatusBadge status={caseItem.status} />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {caseItem.description || 'Sem descrição'}
        </p>
        {subCategoryLabel && (
          <p className="text-xs text-muted-foreground mb-2">
            Subcategoria: {subCategoryLabel}
          </p>
        )}
        <p className="text-xs text-muted-foreground mb-4">
          Criado em: {format(new Date(caseItem.createdAt), 'dd/MM/yyyy')}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          {onUpdateStatus && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStatusToggle}
              className={caseItem.status === 'completed' ? 'text-green-600' : 'text-blue-600'}
            >
              {caseItem.status === 'completed' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
