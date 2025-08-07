import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const PaymentTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const { user } = useAuth();

  const handlePasswordSubmit = () => {
    if (password === 'Jujudopix_420') {
      simulatePayment();
      setShowPasswordInput(false);
      setPassword('');
    } else {
      toast.error('Senha incorreta');
      setPassword('');
    }
  };

  const simulatePayment = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Buscar o último pagamento pendente do usuário
      const { data: payment, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !payment) {
        toast.error('Nenhum pagamento pendente encontrado');
        return;
      }

      // Confirmar o pagamento
      const { error: updateError } = await supabase
        .from('pagamentos')
        .update({ status: 'confirmed' })
        .eq('id', payment.id);

      if (updateError) throw updateError;

      // Ativar assinatura
      const nextPayment = new Date();
      nextPayment.setMonth(nextPayment.getMonth() + 1);

      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          assinatura_ativa: true,
          aprovado_por_admin: true,
          data_aprovacao: new Date().toISOString(),
          proximo_pagamento: nextPayment.toISOString()
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast.success('Pagamento confirmado e assinatura ativada!');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao simular pagamento:', error);
      toast.error('Erro ao confirmar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  if (showPasswordInput) {
    return (
      <div className="flex gap-2 items-center">
        <Input
          type="password"
          placeholder="Digite a senha do desenvolvedor"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
          className="w-64"
        />
        <Button onClick={handlePasswordSubmit} size="sm">
          Confirmar
        </Button>
        <Button 
          onClick={() => {
            setShowPasswordInput(false);
            setPassword('');
          }} 
          variant="outline" 
          size="sm"
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={() => {
        console.log('PaymentTestButton clicked');
        setShowPasswordInput(true);
      }}
      disabled={isLoading}
      variant="outline"
      size="sm"
    >
      {isLoading ? 'Processando...' : 'Simular Pagamento (DEV)'}
    </Button>
  );
};