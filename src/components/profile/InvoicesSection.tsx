import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, FileText, Download, Receipt } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  valor: number;
  status: string;
  metodo_pagamento: string;
  created_at: string;
  assinatura_id: string;
}

const InvoicesSection = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadInvoices();
    }
  }, [user]);

  const loadInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('user_id', user?.id)
        .in('status', ['confirmed', 'paid']) // Apenas faturas pagas
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading invoices:', error);
        toast.error('Erro ao carregar faturas');
        return;
      }

      setInvoices(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('Erro inesperado ao carregar faturas');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'paid':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
            Pago
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pendente
          </Badge>
        );
      case 'cancelled':
      case 'failed':
        return (
          <Badge variant="destructive">
            Cancelado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const generateReceipt = async (invoice: Invoice) => {
    // Verificar se o usuário tem assinatura ativa
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('assinatura_ativa')
        .eq('user_id', user?.id)
        .single();

      if (error || !profile?.assinatura_ativa) {
        toast.error('Comprovantes disponíveis apenas para assinantes ativos');
        return;
      }

      // Gerar PDF com jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Configurar fonte
      doc.setFont('helvetica');
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setTextColor(139, 148, 116); // Cor verde oliva do sistema
      doc.text('COMPROVANTE DE PAGAMENTO', 20, 30);
      
      // Linha separadora
      doc.setDrawColor(139, 148, 116);
      doc.line(20, 35, 190, 35);
      
      // Informações do comprovante
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      let yPosition = 55;
      const lineHeight = 8;
      
      const info = [
        ['Cliente:', user?.user_metadata?.full_name || user?.email || 'Não informado'],
        ['Data do Pagamento:', formatDate(invoice.created_at)],
        ['Valor Pago:', formatCurrency(invoice.valor)],
        ['Status:', 'PAGO'],
        ['Método de Pagamento:', invoice.metodo_pagamento || 'Não informado'],
        ['ID da Transação:', invoice.id],
        ['ID da Assinatura:', invoice.assinatura_id || 'Não informado']
      ];
      
      info.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, 20, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPosition);
        yPosition += lineHeight;
      });
      
      // Rodapé
      yPosition += 20;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Este comprovante serve como prova de pagamento para os serviços contratados.', 20, yPosition);
      doc.text('Emitido em: ' + new Date().toLocaleDateString('pt-BR'), 20, yPosition + 10);
      
      // Logo/Nome da empresa no rodapé
      doc.setFontSize(14);
      doc.setTextColor(139, 148, 116);
      doc.text('Praxis - Sistema Jurídico', 20, yPosition + 30);
      
      // Salvar o PDF
      doc.save(`comprovante-${invoice.id}.pdf`);
      
      toast.success('Comprovante PDF baixado com sucesso');
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast.error('Erro ao gerar comprovante');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Faturas e Comprovantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          Faturas e Comprovantes
        </CardTitle>
        <CardDescription>
          Histórico de pagamentos e comprovantes fiscais para download
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma fatura encontrada</p>
            <p className="text-sm">Suas faturas aparecerão aqui quando você realizar pagamentos</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {new Date(invoice.created_at).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(invoice.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(invoice.valor)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {invoice.metodo_pagamento || 'Não informado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(invoice.status === 'confirmed' || invoice.status === 'paid') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateReceipt(invoice)}
                          className="flex items-center gap-1"
                        >
                          <Download className="h-3 w-3" />
                          Comprovante
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesSection;