import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Palette, Scale } from 'lucide-react';
import { useCustomIcons } from '@/hooks/useCustomIcons';
import { IconManager } from './IconManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarData {
  color?: string;
  character?: string;
  url?: string;
  icon?: string;
  uploadedIconId?: string;
}

interface AvatarSelectorProps {
  currentAvatarUrl: string;
  currentAvatarType: string;
  currentAvatarData: AvatarData;
  fullName: string;
  onAvatarChange: (type: string, data: AvatarData, file?: File) => void;
  children: React.ReactNode;
}

const colorOptions = [
  { name: 'Verde Oliva', value: '#8B9474' },
  { name: 'Laranja Claro', value: '#F5A65B' },
  { name: 'Verde Médio', value: '#6CAE75' },
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Amarelo', value: '#F59E0B' },
  { name: 'Turquesa', value: '#06B6D4' },
  { name: 'Verde Escuro', value: '#059669' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Púrpura', value: '#9333EA' },
  { name: 'Coral', value: '#F97316' },
  { name: 'Esmeralda', value: '#10B981' },
  { name: 'Ciano', value: '#0891B2' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Âmbar', value: '#F59E0B' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Violeta', value: '#7C3AED' },
  { name: 'Fúcsia', value: '#D946EF' },
];

export const AvatarSelector = ({ 
  currentAvatarUrl, 
  currentAvatarType, 
  currentAvatarData, 
  fullName, 
  onAvatarChange, 
  children 
}: AvatarSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(currentAvatarType);
  const [selectedData, setSelectedData] = useState(currentAvatarData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl);
  
  const { getAllAvailableIcons, uploadIconFile, uploadedIcons, deleteUploadedIcon } = useCustomIcons();
  const { toast } = useToast();

  const getInitials = () => {
    if (fullName) {
      const nameParts = fullName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    return 'U';
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive",
        });
        return;
      }
      
      // Upload and save to database
      try {
        const uploadedIcon = await uploadIconFile(file);
        
        setSelectedType('uploaded');
        setSelectedData({ 
          uploadedIconId: uploadedIcon.id,
          url: uploadedIcon.file_url 
        });
        setSelectedFile(null);
        setPreviewUrl(uploadedIcon.file_url);
        
        toast({
          title: "Sucesso",
          description: "Imagem salva e disponível para uso futuro!",
        });
      } catch (error) {
        console.error('Erro ao fazer upload:', error);
      }
    }
  };

  const handleIconSelect = (iconData: any) => {
    setSelectedType('icon');
    setSelectedData({ 
      icon: iconData.id
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleColorSelect = (color: string) => {
    setSelectedData({ ...selectedData, color });
  };

  const handleInitialsSelect = () => {
    setSelectedType('initials');
    setSelectedData({ 
      color: selectedData.color || '#8B9474' 
    });
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleSave = async () => {
    try {
      onAvatarChange(selectedType, selectedData, selectedFile || undefined);
      setOpen(false);
    } catch (error: any) {
      console.error('Erro ao salvar avatar:', error);
    }
  };

  const getPreviewAvatar = () => {
    if ((selectedType === 'upload' || selectedType === 'uploaded') && previewUrl) {
      return <AvatarImage src={previewUrl} alt="Preview" />;
    }
    if (selectedType === 'icon' && selectedData.icon) {
      const availableIcons = getAllAvailableIcons();
      const IconComponent = availableIcons.find(icon => icon.id === selectedData.icon)?.icon;
      if (IconComponent) {
        return (
          <AvatarFallback className="bg-transparent border-2 border-gray-200">
            <IconComponent className="h-8 w-8" />
          </AvatarFallback>
        );
      }
    }
    
    return (
      <AvatarFallback 
        className="text-white text-xl font-semibold"
        style={{ backgroundColor: selectedData.color || '#8B9474' }}
      >
        {getInitials()}
      </AvatarFallback>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolher Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview */}
          <div className="flex flex-col items-center space-y-2">
            <Avatar className="h-20 w-20 border-2 border-gray-200">
              {getPreviewAvatar()}
            </Avatar>
            <p className="text-sm text-muted-foreground">Preview</p>
          </div>

          <Tabs value={selectedType} onValueChange={(value) => {
            setSelectedType(value);
            if (value === 'initials') handleInitialsSelect();
          }} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="initials">
                <Palette className="h-4 w-4 mr-1" />
                Iniciais
              </TabsTrigger>
              <TabsTrigger value="icon">
                <Scale className="h-4 w-4 mr-1" />
                Ícones
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="initials" className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Escolha uma cor:</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      className="w-full h-10 rounded border-2 hover:scale-105 transition-transform"
                      style={{ 
                        backgroundColor: color.value,
                        borderColor: selectedData.color === color.value ? '#000' : 'transparent'
                      }}
                      onClick={() => handleColorSelect(color.value)}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="mt-4">
                  <Label className="text-sm font-medium">Ou escolha uma cor personalizada:</Label>
                  <Input
                    type="color"
                    value={selectedData.color || '#8B9474'}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="mt-2 h-10 w-full"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="icon" className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">Escolha um ícone:</Label>
                <IconManager onIconSelect={(iconId, iconName) => {
                  handleIconSelect({ id: iconId, name: iconName });
                }} />
              </div>
              
              <div>
                <div className="grid grid-cols-3 gap-3 mt-2 max-h-64 overflow-y-auto">
                  {getAllAvailableIcons().map((iconData) => {
                    const IconComponent = iconData.icon;
                    return (
                      <button
                        key={iconData.id}
                        className={`flex flex-col items-center p-3 rounded-lg border-2 hover:bg-gray-50 transition-colors ${
                          selectedData.icon === iconData.id ? 'border-primary' : 'border-gray-200'
                        }`}
                        onClick={() => handleIconSelect(iconData)}
                      >
                        <div className="h-10 w-10 rounded-full flex items-center justify-center mb-2 bg-gray-100">
                          <IconComponent className="h-8 w-8" />
                        </div>
                        <span className="text-xs font-medium text-center">
                          {iconData.name}
                          {iconData.type === 'global' && (
                            <span className="block text-xs text-purple-600">Especial</span>
                          )}
                          {iconData.type === 'custom' && (
                            <span className="block text-xs text-blue-600">Personalizado</span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <div>
                <Label htmlFor="avatar-file" className="text-sm font-medium">
                  Enviar sua própria foto:
                </Label>
                <Input
                  id="avatar-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-2"
                />
              </div>
              
              {/* Uploaded Icons Section */}
              {uploadedIcons.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Suas imagens salvas:</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2 max-h-48 overflow-y-auto">
                    {uploadedIcons.map((uploadedIcon) => (
                      <div
                        key={uploadedIcon.id}
                        className={`relative group flex flex-col items-center p-2 rounded-lg border-2 hover:bg-gray-50 transition-colors cursor-pointer ${
                          selectedData.uploadedIconId === uploadedIcon.id ? 'border-primary' : 'border-gray-200'
                        }`}
                        onClick={() => {
                          setSelectedType('uploaded');
                          setSelectedData({ 
                            uploadedIconId: uploadedIcon.id,
                            url: uploadedIcon.file_url 
                          });
                          setPreviewUrl(uploadedIcon.file_url);
                        }}
                      >
                        <img
                          src={uploadedIcon.file_url}
                          alt={uploadedIcon.icon_name}
                          className="w-12 h-12 object-cover rounded mb-1"
                        />
                        <span className="text-xs text-center font-medium truncate w-full">
                          {uploadedIcon.icon_name}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteUploadedIcon(uploadedIcon.id);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};