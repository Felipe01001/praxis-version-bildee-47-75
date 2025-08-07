import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Edit, Plus, Settings } from 'lucide-react';
import { useCustomIcons, CustomIcon } from '@/hooks/useCustomIcons';
import { useToast } from '@/hooks/use-toast';
import * as LucideIcons from 'lucide-react';
interface IconManagerProps {
  onIconSelect?: (iconId: string, iconName: string) => void;
}
export const IconManager = ({
  onIconSelect
}: IconManagerProps) => {
  const [open, setOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<CustomIcon | null>(null);
  const [newIconId, setNewIconId] = useState('');
  const [newIconName, setNewIconName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const {
    customIcons,
    loading,
    addCustomIcon,
    updateCustomIcon,
    deleteCustomIcon
  } = useCustomIcons();
  const {
    toast
  } = useToast();

  // Lista de ícones disponíveis do Lucide
  const availableLucideIcons = ['Accessibility', 'Activity', 'Airplay', 'AlertCircle', 'AlertTriangle', 'Archive', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'Atom', 'Baby', 'Backpack', 'Badge', 'Banana', 'Battery', 'Bell', 'Bike', 'Bluetooth', 'Bookmark', 'Box', 'Calendar', 'Camera', 'Car', 'Cat', 'Check', 'ChevronDown', 'ChevronLeft', 'ChevronRight', 'ChevronUp', 'Circle', 'Clock', 'Cloud', 'Code', 'Coffee', 'Computer', 'Cookie', 'Copy', 'Database', 'Delete', 'Diamond', 'Dog', 'Download', 'Edit', 'Eye', 'EyeOff', 'Facebook', 'Film', 'Filter', 'Flag', 'Folder', 'Gift', 'Github', 'Globe', 'Hammer', 'Hand', 'Headphones', 'Heart', 'Help', 'History', 'Image', 'Inbox', 'Info', 'Key', 'Laptop', 'Layers', 'Layout', 'Lightbulb', 'Link', 'Lock', 'Mail', 'Map', 'Menu', 'Microphone', 'Monitor', 'Moon', 'Music', 'Navigation', 'Package', 'Palette', 'Paperclip', 'Phone', 'Play', 'Plus', 'Printer', 'Puzzle', 'Radio', 'Rocket', 'Save', 'Send', 'Settings', 'Share', 'Shield', 'ShoppingCart', 'Star', 'Sun', 'Target', 'Terminal', 'ThumbsUp', 'Timer', 'Tool', 'Trash', 'TrendingUp', 'Trophy', 'Umbrella', 'Upload', 'User', 'Video', 'Volume', 'Wallet', 'Watch', 'Wifi', 'X', 'Zap', 'Zoom'];
  const handleAddIcon = async () => {
    if (!newIconId || !newIconName) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o ID e nome do ícone.",
        variant: "destructive"
      });
      return;
    }
    try {
      await addCustomIcon(newIconId, newIconName);
      setNewIconId('');
      setNewIconName('');
      setShowAddForm(false);
    } catch (error) {
      // Error is already handled in the hook
    }
  };
  const handleUpdateIcon = async () => {
    if (!editingIcon) return;
    try {
      await updateCustomIcon(editingIcon.id, {
        icon_name: newIconName || editingIcon.icon_name,
        icon_id: newIconId || editingIcon.icon_id
      });
      setEditingIcon(null);
      setNewIconId('');
      setNewIconName('');
    } catch (error) {
      // Error is already handled in the hook
    }
  };
  const handleDeleteIcon = async (iconId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este ícone?')) {
      try {
        await deleteCustomIcon(iconId);
      } catch (error) {
        // Error is already handled in the hook
      }
    }
  };
  const startEditing = (icon: CustomIcon) => {
    setEditingIcon(icon);
    setNewIconId(icon.icon_id);
    setNewIconName(icon.icon_name);
    setShowAddForm(false);
  };
  const cancelEdit = () => {
    setEditingIcon(null);
    setNewIconId('');
    setNewIconName('');
  };
  const renderIcon = (iconId: string) => {
    const IconComponent = (LucideIcons as any)[iconId];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <LucideIcons.HelpCircle className="h-5 w-5" />;
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerenciar Ícones Personalizados</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {editingIcon ? 'Editar Ícone' : 'Adicionar Novo Ícone'}
              </h3>
              {!showAddForm && !editingIcon && <Button onClick={() => setShowAddForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>}
            </div>

            {(showAddForm || editingIcon) && <div className="space-y-4">
                <div>
                  <Label htmlFor="icon-select">Selecionar Ícone</Label>
                  <Select value={newIconId} onValueChange={setNewIconId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um ícone" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {availableLucideIcons.map(iconName => <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center space-x-2">
                            {renderIcon(iconName)}
                            <span>{iconName}</span>
                          </div>
                        </SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="icon-name">Nome do Ícone</Label>
                  <Input id="icon-name" value={newIconName} onChange={e => setNewIconName(e.target.value)} placeholder="Nome personalizado para o ícone" />
                </div>

                <div className="flex space-x-2">
                  {editingIcon ? <>
                      <Button onClick={handleUpdateIcon} disabled={loading}>
                        Atualizar
                      </Button>
                      <Button variant="outline" onClick={cancelEdit}>
                        Cancelar
                      </Button>
                    </> : <>
                      <Button onClick={handleAddIcon} disabled={loading}>
                        Adicionar
                      </Button>
                      <Button variant="outline" onClick={() => setShowAddForm(false)}>
                        Cancelar
                      </Button>
                    </>}
                </div>
              </div>}
          </div>

          {/* Custom Icons List */}
          <div>
            <h3 className="text-lg font-medium mb-4">Seus Ícones Personalizados</h3>
            {customIcons.length === 0 ? <p className="text-muted-foreground text-center py-8">
                Nenhum ícone personalizado ainda. Adicione seu primeiro ícone!
              </p> : <div className="grid grid-cols-1 gap-3">
                {customIcons.map(icon => <div key={icon.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 flex items-center justify-center">
                        {renderIcon(icon.icon_id)}
                      </div>
                      <div>
                        <p className="font-medium">{icon.icon_name}</p>
                        <p className="text-sm text-muted-foreground">{icon.icon_id}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {onIconSelect && <Button size="sm" variant="outline" onClick={() => onIconSelect(icon.icon_id, icon.icon_name)}>
                          Usar
                        </Button>}
                      <Button size="sm" variant="outline" onClick={() => startEditing(icon)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteIcon(icon.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>)}
              </div>}
          </div>
        </div>
      </DialogContent>
    </Dialog>;
};