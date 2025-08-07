-- Criar tabela para avatares globais disponíveis para todos os usuários
CREATE TABLE public.global_avatars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.global_avatars ENABLE ROW LEVEL SECURITY;

-- Políticas para avatares globais - todos podem visualizar
CREATE POLICY "Anyone can view global avatars" 
ON public.global_avatars 
FOR SELECT 
USING (true);

-- Apenas autenticados podem criar/editar (para admins)
CREATE POLICY "Authenticated users can manage global avatars" 
ON public.global_avatars 
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Atualizar políticas de ícones personalizados para permitir visualização por todos
DROP POLICY IF EXISTS "Users can view their own custom icons" ON public.user_custom_icons;

CREATE POLICY "Anyone can view custom icons" 
ON public.user_custom_icons 
FOR SELECT 
USING (true);

-- Criar trigger para update timestamp
CREATE TRIGGER update_global_avatars_updated_at
BEFORE UPDATE ON public.global_avatars
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns avatares iniciais baseados nas imagens que já existem no projeto
INSERT INTO public.global_avatars (name, category, image_url, storage_path) VALUES
('Advogado Masculino 1', 'lawyer', '/src/assets/avatars/lawyer-male-1.png', 'lawyer-male-1.png'),
('Advogado Masculino 2', 'lawyer', '/src/assets/avatars/lawyer-male-2.png', 'lawyer-male-2.png'),
('Advogada Feminina 1', 'lawyer', '/src/assets/avatars/lawyer-female-1.png', 'lawyer-female-1.png'),
('Advogada Feminina 2', 'lawyer', '/src/assets/avatars/lawyer-female-2.png', 'lawyer-female-2.png'),
('Executivo Masculino', 'business', '/src/assets/avatars/business-male-1.png', 'business-male-1.png'),
('Executiva Feminina', 'business', '/src/assets/avatars/business-female-1.png', 'business-female-1.png'),
('Magistrado Masculino', 'judge', '/src/assets/avatars/judge-male-1.png', 'judge-male-1.png'),
('Magistrada Feminina', 'judge', '/src/assets/avatars/judge-female-1.png', 'judge-female-1.png'),
('Consultor Masculino', 'consultant', '/src/assets/avatars/consultant-male-1.png', 'consultant-male-1.png'),
('Consultora Feminina', 'consultant', '/src/assets/avatars/consultant-female-1.png', 'consultant-female-1.png');