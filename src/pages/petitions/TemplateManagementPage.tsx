import React, { useState } from 'react';
import { Plus, Upload, Search, FileText, Trash2, Edit, Eye, Download, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePetitionTemplates } from '@/hooks/usePetitionTemplates';
import { CategoryManager } from '@/components/petition/CategoryManager';
import { TemplateViewerModal } from '@/components/petition/TemplateViewerModal';
import { PetitionTemplateWithFiles } from '@/types/petition-template';
import { toast } from 'sonner';
const templateFormSchema = z.object({
  tema: z.string().min(1, 'Tema é obrigatório'),
  subtema: z.string().min(1, 'Subtema é obrigatório'),
  titulo: z.string().min(1, 'Título é obrigatório'),
  ordem: z.string().min(1, 'Ordem é obrigatória'),
  descricao: z.string().optional()
});
type TemplateFormValues = z.infer<typeof templateFormSchema>;
const TEMAS_PREDEFINIDOS = ['PETIÇÃO GERAL', 'ACIDENTE DE TRÂNSITO', 'BANCO-CARTÃO DE CRÉDITO', 'COBRANÇA DE DÍVIDA', 'COMPRA DE PRODUTO – CONSUMIDOR', 'CONDOMÍNIO-DIREITO DE VIZINHANÇA', 'DESPEJO PARA USO PRÓPRIO', 'ESTABELECIMENTO DE ENSINO', 'EXECUÇÃO DE TÍTULO EXTRAJUDICIAL', 'EXECUÇÃO DE TÍTULO JUDICIAL', 'LOCAÇÃO DE IMÓVEL', 'NEGATIVAÇÃO INDEVIDA', 'OPERADORA DE TURISMO', 'PLANOS DE SAÚDE', 'PRESTAÇÃO DE SERVIÇOS – CONSUMIDOR', 'TELEFONIA-TV-INTERNET', 'TRANSPORTE AÉREO', 'TRANSPORTE RODOVIÁRIO', 'VEÍCULOS, exceto COLISÃO', 'JUIZADOS ESPECIAIS DA FAZENDA DO DF', 'AÇÕES CONTRA CAESB e CEB', 'COMPRA E VENDA ENTRE PARTICULARES', 'CONSÓRCIO', 'MEUS MODELOS'];
export const TemplateManagementPage = () => {
  const {
    templates,
    loading,
    createTemplate,
    uploadFile,
    fetchTemplates,
    downloadFile,
    deleteTemplate,
    deleteFile,
    clearAllTemplates
  } = usePetitionTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PetitionTemplateWithFiles | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      tema: '',
      subtema: '',
      titulo: '',
      ordem: '',
      descricao: ''
    }
  });
  const onSubmit = async (values: TemplateFormValues) => {
    try {
      const templateData = {
        tema: values.tema,
        subtema: values.subtema,
        titulo: values.titulo,
        ordem: values.ordem,
        descricao: values.descricao || undefined
      };
      await createTemplate(templateData);
      setIsCreateDialogOpen(false);
      form.reset();
      toast.success('Modelo criado com sucesso');
    } catch (error) {
      toast.error('Erro ao criar modelo');
    }
  };
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, templateId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      toast.error('Apenas arquivos PDF e DOCX são permitidos');
      return;
    }
    await uploadFile(file, templateId);
    event.target.value = '';
  };
  const handleViewTemplate = (template: PetitionTemplateWithFiles) => {
    setSelectedTemplate(template);
    setIsViewerOpen(true);
  };
  const handleDeleteTemplate = async (templateId: string, templateTitle: string) => {
    if (confirm(`Tem certeza que deseja deletar o modelo "${templateTitle}"? Esta ação não pode ser desfeita.`)) {
      await deleteTemplate(templateId);
    }
  };
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (confirm(`Tem certeza que deseja deletar o arquivo "${fileName}"?`)) {
      await deleteFile(fileId);
    }
  };
  const handleClearAllTemplates = async () => {
    try {
      await clearAllTemplates();
      toast.success('Todos os modelos foram removidos com sucesso');
    } catch (error) {
      toast.error('Erro ao remover todos os modelos');
    }
  };
  const handleAddTemplate = async (categoryTitle: string, itemTitle: string, order: string) => {
    try {
      const templateData = {
        tema: categoryTitle,
        subtema: 'Geral',
        titulo: itemTitle,
        ordem: order,
        descricao: `Modelo para ${itemTitle}`
      };
      await createTemplate(templateData);
      toast.success('Modelo adicionado com sucesso');
    } catch (error) {
      toast.error('Erro ao adicionar modelo');
    }
  };
  const handleCategoryFileUpload = async (itemId: string, file: File) => {
    try {
      // Encontrar o template existente ou criar um novo baseado no itemId
      let templateId = null;

      // Procurar se já existe um template com esse itemId como ordem
      const existingTemplate = templates.find(t => t.ordem === itemId);
      if (existingTemplate) {
        templateId = existingTemplate.id;
      } else {
        // Se não existir, precisamos criar o template primeiro
        // Buscar informações do item nas categorias hardcoded
        const categoryData = getCategoryDataByItemId(itemId);
        if (!categoryData) {
          toast.error('Item não encontrado nas categorias');
          return;
        }
        const templateData = {
          tema: categoryData.categoryTitle,
          subtema: 'Geral',
          titulo: categoryData.itemTitle,
          ordem: itemId,
          descricao: `Modelo para ${categoryData.itemTitle}`
        };
        const newTemplate = await createTemplate(templateData);
        templateId = newTemplate.id;
      }
      await uploadFile(file, templateId);
    } catch (error) {
      console.error('Erro no upload do arquivo:', error);
      toast.error('Erro ao fazer upload do arquivo');
    }
  };
  const handleCategoryMultipleFileUpload = async (itemId: string, files: File[]) => {
    try {
      // Encontrar o template existente ou criar um novo baseado no itemId
      let templateId = null;

      // Procurar se já existe um template com esse itemId como ordem
      const existingTemplate = templates.find(t => t.ordem === itemId);
      if (existingTemplate) {
        templateId = existingTemplate.id;
      } else {
        // Se não existir, precisamos criar o template primeiro
        // Buscar informações do item nas categorias hardcoded
        const categoryData = getCategoryDataByItemId(itemId);
        if (!categoryData) {
          toast.error('Item não encontrado nas categorias');
          return;
        }
        const templateData = {
          tema: categoryData.categoryTitle,
          subtema: 'Geral',
          titulo: categoryData.itemTitle,
          ordem: itemId,
          descricao: `Modelo para ${categoryData.itemTitle}`
        };
        const newTemplate = await createTemplate(templateData);
        templateId = newTemplate.id;
      }

      // Upload de todos os arquivos
      for (const file of files) {
        await uploadFile(file, templateId);
      }
    } catch (error) {
      console.error('Erro no upload dos arquivos:', error);
      toast.error('Erro ao fazer upload dos arquivos');
    }
  };

  // Função auxiliar para buscar dados do item pelas categorias
  const getCategoryDataByItemId = (itemId: string) => {
    // Lista das categorias hardcoded (incluindo todas as categorias 20-23)
    const categories = [{
      title: 'PETIÇÃO GERAL',
      items: [{
        id: '1.1',
        title: 'Petição inicial – GERAL – Contra PESSOA FÍSICA'
      }, {
        id: '1.2',
        title: 'PETIÇÃO INICIAL - GERAL - contra PESSOA JURÍDICA'
      }, {
        id: '1.3',
        title: 'PETIÇÃO INICIAL - GERAL - contra Órgão GDF - Juizado da Fazenda do DF'
      }, {
        id: '1.4',
        title: 'Estrutura básica de PETIÇÃO INICIAL'
      }]
    }, {
      title: 'ACIDENTE DE TRÂNSITO',
      items: [{
        id: '2.1',
        title: 'ACIDENTE de TRÂNSITO - UM autor x UM requerido - reparação de danos'
      }, {
        id: '2.2',
        title: 'ACIDENTE de TRÂNSITO - UM autor x DOIS requeridos - reparação de danos'
      }, {
        id: '2.3',
        title: 'ACIDENTE de TRÂNSITO - DOIS autores x UM requerido - reparação de danos'
      }, {
        id: '2.4',
        title: 'ACIDENTE de TRÂNSITO - DOIS autores x DOIS requeridos - reparação de danos'
      }, {
        id: '2.5',
        title: 'Acidente de Trânsito - ORIENTAÇÕES'
      }]
    }, {
      title: 'BANCO-CARTÃO DE CRÉDITO',
      items: [{
        id: '3.01',
        title: 'BANCO – desconto indevido em conta – GERAL - REPETIÇÃO INDÉBITO'
      }, {
        id: '3.02',
        title: 'BANCO – CHEQUE CLONADO e COMPENSADO – Ressarcimento'
      }, {
        id: '3.03',
        title: 'BANCO – CHEQUE CLONADO e DEVOLVIDO SEM FUNDOS – Obrigação de fazer'
      }, {
        id: '3.04',
        title: 'BANCO – Abertura de CONTA SALÁRIO – Taxa de Manutenção INDEVIDA – REPETIÇÃO INDÉBITO'
      }, {
        id: '3.05',
        title: 'BANCO – Transações bancárias clandestinas – NULIDADE de negócio jurídico'
      }]
    }, {
      title: 'COBRANÇA DE DÍVIDA',
      items: [{
        id: '4.1.0',
        title: 'COBRANÇA - Venda de mercadoria - falta de pagamento'
      }, {
        id: '4.2.0',
        title: 'COBRANÇA - Prestação de serviço - falta de pagamento'
      }, {
        id: '4.3',
        title: 'COBRANÇA - Empréstimo de dinheiro - falta de pagamento'
      }]
    }, {
      title: 'COMPRA DE PRODUTO – CONSUMIDOR',
      items: [{
        id: '5.1.0',
        title: 'COMPRA E VENDA – produto NÃO entregue – rescisão contratual e devolução de quantia paga'
      }, {
        id: '5.2.0',
        title: 'COMPRA E VENDA – produto DEFEITUOSO – rescisão contratual e devolução de quantia paga'
      }]
    }, {
      title: 'CONDOMÍNIO-DIREITO DE VIZINHANÇA',
      items: [{
        id: '6.1',
        title: 'VIZINHANÇA – Perturbação do sossego – BARULHO'
      }, {
        id: '6.2',
        title: 'VIZINHANÇA – direito de CONSTRUIR – permissão de acesso ao imóvel do vizinho'
      }]
    }, {
      title: 'JUIZADOS ESPECIAIS DA FAZENDA DO DF',
      items: [{
        id: '20.1',
        title: 'FAZENDA – Réu GDF - servidor ATIVO – Exercícios financeiros não pagos'
      }, {
        id: '20.2',
        title: 'FAZENDA - Réu GDF - servidor INATIVO - Exercícios findos não pagos'
      }, {
        id: '20.3',
        title: 'FAZENDA – Réu GDF - servidor ATIVO – Reconhecimento de gratificação'
      }, {
        id: '20.4',
        title: 'FAZENDA – Réu GDF – NÃO fornecimento de medicação – Ressarcimento'
      }, {
        id: '20.5',
        title: 'FAZENDA – Réu GDF – Saúde – CIRURGIA - Tutela de URGÊNCIA'
      }, {
        id: '20.6',
        title: 'FAZENDA – Réu GDF – Saúde – EXAME - Tutela de URGÊNCIA'
      }, {
        id: '20.7',
        title: 'FAZENDA – Réu GDF – Saúde – MEDICAMENTO - Tutela de URGÊNCIA'
      }, {
        id: '20.8',
        title: 'FAZENDA – Réu GDF – Saúde – TRATAMENTO - Tutela de URGÊNCIA'
      }, {
        id: '20.9',
        title: 'FAZENDA – Réu GDF-DER–NOVACAP - BURACO NA PISTA – ressarcimento de custo'
      }, {
        id: '20.10',
        title: 'FAZENDA – Réu GDF-NOVACAP – BURACO NA PISTA – ressarcimento de custo'
      }, {
        id: '20.11',
        title: 'FAZENDA – Réu GDF-DETRAN – BAIXA DE REGISTRO DE VEÍCULO – débitos de IPVA'
      }, {
        id: '20.12.0',
        title: 'FAZENDA – Réu GDF-DETRAN – Venda de Veículo – NEGATIVA de PROPRIEDADE – Débitos de IPVA'
      }, {
        id: '20.12.1',
        title: 'FAZENDA – Réu DETRAN – Venda de Veículo – Comunicado de venda - NEGATIVA de PROPRIEDADE'
      }, {
        id: '20.13',
        title: 'FAZENDA – Réu DER - DETRAN – NULIDADE DE MULTA'
      }, {
        id: '20.14',
        title: 'FAZENDA – Réu DETRAN – NULIDADE DE MULTA'
      }, {
        id: '20.15',
        title: 'FAZENDA – Réu DER – NULIDADE DE MULTA'
      }, {
        id: '20.16',
        title: 'FAZENDA – Réu DER-DETRAN – NULIDADE DE MULTA – falta de NOTIFICAÇÃO'
      }, {
        id: '20.17',
        title: 'FAZENDA – Réu DETRAN – NULIDADE DE MULTA – falta de NOTIFICAÇÃO'
      }, {
        id: '20.18',
        title: 'FAZENDA – Réu DER – NULIDADE DE MULTA – falta de NOTIFICAÇÃO'
      }, {
        id: '20.19',
        title: 'FAZENDA – Réu DETRAN – BAIXA DE REGISTRO DE VEÍCULO'
      }, {
        id: '20.20',
        title: 'FAZENDA – Réu DETRAN – CLONAGEM de PLACA – NULIDADE DE MULTA'
      }, {
        id: '20.21',
        title: 'FAZENDA – Réu DER-DETRAN – CNH - Transferência de PONTUAÇÃO'
      }, {
        id: '20.22',
        title: 'FAZENDA – Réu DER – CNH - Transferência de PONTUAÇÃO'
      }, {
        id: '20.23',
        title: 'FAZENDA – Réu DETRAN – CNH - Transferência de PONTUAÇÃO'
      }, {
        id: '20.24',
        title: 'FAZENDA – Réu DETRAN – CNH Definitiva – Negativa de RENOVAÇÃO'
      }, {
        id: '20.25',
        title: 'FAZENDA – Réu DETRAN – CNH Definitiva – inclusão EAR - demora de RENOVAÇÃO'
      }, {
        id: '20.26',
        title: 'FAZENDA – Réu DETRAN – CNH Provisória – Negativa da DEFINITIVA'
      }, {
        id: '20.27',
        title: 'FAZENDA – Réu DF-DETRAN – Venda de Veículo – NULIDADE de PROPRIEDADE - negativação indevida – DANOS MORAIS - tutela de urgência'
      }, {
        id: '20.28',
        title: 'FAZENDA – Réu GDF – Cidadão – Excesso de tributo – ITBI – restituição da diferença'
      }]
    }, {
      title: 'AÇÕES CONTRA CAESB e CEB',
      items: [{
        id: '21.1',
        title: 'CAESB – AUMENTO SUBSTANCIAL – CONTAS PAGAS - CAÇA-VAZAMENTOS - DEVOLUÇÃO EM DOBRO'
      }, {
        id: '21.2',
        title: 'CAESB – AUMENTO SUBSTANCIAL - CONTAS NÃO PAGAS – CORTE DE ÁGUA - Tutela de Urgência'
      }, {
        id: '21.3',
        title: 'CAESB – AUMENTO SUBSTANCIAL - CONTAS NÃO PAGAS – AMEAÇA DE CORTE - Tutela de Urgência'
      }, {
        id: '21.4',
        title: 'CAESB – MULTA INDEVIDA – CONTA PAGA - DEVOLUÇÃO EM DOBRO'
      }, {
        id: '21.5',
        title: 'CAESB – MULTA INDEVIDA - CONTAS NÃO PAGAS – CORTE DE ÁGUA - Tutela de Urgência'
      }, {
        id: '21.6',
        title: 'CAESB – MULTA INDEVIDA – CONTAS NÃO PAGAS – AMEAÇA DE CORTE - Tutela de Urgência'
      }, {
        id: '21.7',
        title: 'CEB – AUMENTO SUBSTANCIAL – CONTAS PAGAS – DEVOLUÇÃO EM DOBRO'
      }, {
        id: '21.8',
        title: 'CEB – AUMENTO SUBSTANCIAL – CONTAS NÃO PAGAS – CORTE DE ENERGIA - Tutela de Urgência'
      }, {
        id: '21.9',
        title: 'CEB – AUMENTO SUBSTANCIAL – CONTAS NÃO PAGAS – AMEAÇA DE CORTE - Tutela de Urgência'
      }, {
        id: '21.10',
        title: 'CEB – Queda de ENERGIA – DANO EQUIPAMENTO ELÉTRICO - INDENIZAÇÃO'
      }]
    }, {
      title: 'COMPRA E VENDA ENTRE PARTICULARES',
      items: [{
        id: '22.1',
        title: 'COMPRA E VENDA – falta de pagamento – rescisão de contrato – devolução do bem'
      }]
    }, {
      title: 'CONSÓRCIO',
      items: [{
        id: '23.1',
        title: 'CONSÓRCIO – Desistência Contratual – RESTITUIÇÃO dos valores pagos'
      }]
    }];
    for (const category of categories) {
      const item = category.items.find(i => i.id === itemId);
      if (item) {
        return {
          categoryTitle: category.title,
          itemTitle: item.title
        };
      }
    }
    return null;
  };
  const handleDownload = async (fileUrl: string, fileName: string) => {
    await downloadFile(fileUrl, fileName);
  };
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || template.tema.toLowerCase().includes(searchTerm.toLowerCase()) || template.subtema.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || template.tema === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  return <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Modelos de Petições</h1>
          <p className="text-muted-foreground">
            Gerencie os modelos organizados por tema e subtema ({templates.length} modelos disponíveis)
          </p>
        </div>

        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Confirmar Exclusão de Todos os Modelos
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá apagar permanentemente todos os {templates.length} modelos de petições e seus arquivos associados. 
                  <br /><br />
                  <strong>Esta ação não pode ser desfeita!</strong>
                  <br />
                  Tem certeza que deseja continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleClearAllTemplates} className="bg-destructive hover:bg-destructive/90">
                  Sim, Apagar Todos
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-praxis-olive hover:bg-praxis-olive/90">
                <Plus className="mr-2 h-4 w-4" />
                Novo Modelo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Novo Modelo</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="tema" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Tema</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {TEMAS_PREDEFINIDOS.map(tema => <SelectItem key={tema} value={tema}>
                                {tema}
                              </SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="subtema" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Subtema</FormLabel>
                        
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="titulo" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do modelo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="ordem" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Ordem</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: 1.1.1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <FormField control={form.control} name="descricao" render={({
                  field
                }) => <FormItem>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Descrição do modelo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>} />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Criar Modelo</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <CategoryManager onAddTemplate={handleAddTemplate} onFileUpload={handleCategoryFileUpload} onMultipleFileUpload={handleCategoryMultipleFileUpload} templatesFromDb={templates} />
      </div>

      {/* Lista de modelos existentes com arquivos */}
      {templates.length > 0 && <Card>
          <CardHeader>
            <CardTitle>Modelos Cadastrados</CardTitle>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por título, tema ou subtema..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Filtrar por categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todas as categorias</SelectItem>
                  {TEMAS_PREDEFINIDOS.map(tema => <SelectItem key={tema} value={tema}>
                      {tema}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTemplates.map((template, index) => <div key={`${template.id}-${index}`} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{template.ordem}</Badge>
                        <Badge>{template.tema}</Badge>
                      </div>
                      <h3 className="font-medium">{template.titulo}</h3>
                      {template.descricao && <p className="text-sm text-muted-foreground">{template.descricao}</p>}
                    </div>
                    <div className="flex gap-2">
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-background border z-50">
                          <DropdownMenuItem onClick={() => handleDeleteTemplate(template.id, template.titulo)} className="text-destructive hover:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Apagar Modelo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Upload de arquivo */}
                  <div className="flex items-center gap-2">
                    <input type="file" accept=".pdf,.docx" onChange={e => handleFileUpload(e, template.id)} className="hidden" id={`file-upload-${template.id}`} />
                    <Button size="sm" variant="outline" onClick={() => document.getElementById(`file-upload-${template.id}`)?.click()}>
                      <Upload className="mr-2 h-4 w-4" />
                      Adicionar Arquivo
                    </Button>
                  </div>

                  {/* Lista de arquivos */}
                  {template.files && template.files.length > 0 && <div className="space-y-2">
                      <h4 className="text-sm font-medium">Arquivos ({template.files.length})</h4>
                      <div className="grid gap-2">
                        {template.files.map(file => <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm font-medium">{file.arquivo_nome}</span>
                              <Badge variant="secondary" className="text-xs">
                                {file.tipo.toUpperCase()}
                              </Badge>
                              {file.file_size && <span className="text-xs text-muted-foreground">
                                  ({(file.file_size / 1024).toFixed(1)}KB)
                                </span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button size="sm" variant="ghost" onClick={() => handleDownload(file.arquivo_url, file.arquivo_nome)} title="Visualizar e baixar arquivo">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDownload(file.arquivo_url, file.arquivo_nome)} title="Baixar arquivo">
                                <Download className="h-4 w-4" />
                              </Button>
                              
                            </div>
                          </div>)}
                      </div>
                    </div>}
                </div>)}
            </div>
          </CardContent>
        </Card>}

      <TemplateViewerModal isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} template={selectedTemplate} />
    </div>;
};
export default TemplateManagementPage;