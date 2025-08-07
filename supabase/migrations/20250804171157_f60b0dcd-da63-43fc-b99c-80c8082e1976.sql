-- Limpar todos os ícones personalizados existentes
DELETE FROM public.user_custom_icons;

-- Criar tabela para ícones globais disponíveis para todos os usuários
CREATE TABLE IF NOT EXISTS public.global_icons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_id text NOT NULL UNIQUE,
  icon_name text NOT NULL,
  icon_type text NOT NULL DEFAULT 'custom',
  icon_data jsonb DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.global_icons ENABLE ROW LEVEL SECURITY;

-- Create policy for reading global icons (everyone can see them)
CREATE POLICY "Anyone can view global icons" 
ON public.global_icons 
FOR SELECT 
USING (true);

-- Create policy for inserting global icons (system only)
CREATE POLICY "System can insert global icons" 
ON public.global_icons 
FOR INSERT 
WITH CHECK (true);

-- Create policy for updating global icons (system only)
CREATE POLICY "System can update global icons" 
ON public.global_icons 
FOR UPDATE 
USING (true);

-- Create policy for deleting global icons (system only)
CREATE POLICY "System can delete global icons" 
ON public.global_icons 
FOR DELETE 
USING (true);

-- Insert the new Halloween-themed icons
INSERT INTO public.global_icons (icon_id, icon_name, icon_type, icon_data) VALUES
('person-hat-sunglasses', 'Pessoa com Chapéu e Óculos', 'custom', '{"emoji": "🕴️", "description": "Pessoa com chapéu e óculos escuros"}'),
('witch-hat', 'Chapéu de Bruxa', 'custom', '{"emoji": "🎃", "description": "Chapéu de bruxa roxo com fivela amarela"}'),
('zombie-face', 'Rosto de Zumbi', 'custom', '{"emoji": "🧟", "description": "Rosto de zumbi verde"}'),
('bat-moon', 'Morcego na Lua', 'custom', '{"emoji": "🦇", "description": "Morcego em frente a lua amarela"}'),
('black-cat', 'Gato Preto', 'custom', '{"emoji": "🐱", "description": "Gato preto"}'),
('owl-face', 'Rosto de Coruja', 'custom', '{"emoji": "🦉", "description": "Rosto de coruja"}'),
('grim-reaper', 'Ceifador', 'custom', '{"emoji": "💀", "description": "Figura da morte"}'),
('frankenstein', 'Frankenstein', 'custom', '{"emoji": "🧟‍♂️", "description": "Rosto de criatura verde (Frankenstein)"}'),
('vampire', 'Vampiro', 'custom', '{"emoji": "🧛", "description": "Vampiro com olhos vermelhos"}'),
('potion-bottle', 'Frasco de Poção', 'custom', '{"emoji": "🧪", "description": "Frasco de poção com líquido verde e brilhos"});

-- Add trigger for auto-updating timestamps
CREATE TRIGGER update_global_icons_updated_at
  BEFORE UPDATE ON public.global_icons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();