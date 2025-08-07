import React from 'react';
import { Upload, FileText, Eye, Download, Trash2, Edit, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PetitionTemplateWithFiles } from '@/types/petition-template';

interface TemplateCardProps {
  template: PetitionTemplateWithFiles;
  onView: (template: PetitionTemplateWithFiles) => void;
  onDelete: (templateId: string, templateTitle: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, templateId: string) => void;
  onDownload: (fileUrl: string, fileName: string) => void;
  onDeleteFile: (fileId: string, fileName: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onView,
  onDelete,
  onFileUpload,
  onDownload,
  onDeleteFile
}) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{template.ordem}</Badge>
            <Badge>{template.tema}</Badge>
          </div>
          <h3 className="font-medium">{template.titulo}</h3>
          {template.descricao && (
            <p className="text-sm text-muted-foreground">{template.descricao}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onView(template)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-background border z-50">
              <DropdownMenuItem 
                onClick={() => onDelete(template.id, template.titulo)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Apagar Modelo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Upload de arquivo */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => onFileUpload(e, template.id)}
          className="hidden"
          id={`file-upload-${template.id}`}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => document.getElementById(`file-upload-${template.id}`)?.click()}
        >
          <Upload className="mr-2 h-4 w-4" />
          Adicionar Arquivo
        </Button>
      </div>

      {/* Lista de arquivos */}
      {template.files && template.files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Arquivos ({template.files.length})</h4>
          <div className="grid gap-2">
            {template.files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">{file.arquivo_nome}</span>
                  <Badge variant="secondary" className="text-xs">
                    {file.tipo.toUpperCase()}
                  </Badge>
                  {file.file_size && (
                    <span className="text-xs text-muted-foreground">
                      ({(file.file_size / 1024).toFixed(1)}KB)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(file.arquivo_url, file.arquivo_nome)}
                    title="Visualizar e baixar arquivo"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(file.arquivo_url, file.arquivo_nome)}
                    title="Baixar arquivo"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteFile(file.id, file.arquivo_nome)}
                    title="Deletar arquivo"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};