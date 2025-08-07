-- Limpar todos os ícones personalizados existentes
DELETE FROM public.user_custom_icons;

-- Criar tabela para ícones globais disponíveis para todos os usuários
CREATE TABLE public.global_icons (
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

-- Create policies
CREATE POLICY "Anyone can view global icons" ON public.global_icons FOR SELECT USING (true);
CREATE POLICY "System can insert global icons" ON public.global_icons FOR INSERT WITH CHECK (true);
CREATE POLICY "System can update global icons" ON public.global_icons FOR UPDATE USING (true);
CREATE POLICY "System can delete global icons" ON public.global_icons FOR DELETE USING (true);

-- Insert the new Halloween-themed icons
INSERT INTO public.global_icons (icon_id, icon_name, icon_type, icon_data) VALUES
('person-hat-sunglasses', 'Pessoa com Chapéu e Óculos', 'custom', '{"emoji": "🕴️"}'),
('witch-hat', 'Chapéu de Bruxa', 'custom', '{"emoji": "🎃"}'),
('zombie-face', 'Rosto de Zumbi', 'custom', '{"emoji": "🧟"}'),
('bat-moon', 'Morcego na Lua', 'custom', '{"emoji": "🦇"}'),
('black-cat', 'Gato Preto', 'custom', '{"emoji": "🐱"}'),
('owl-face', 'Rosto de Coruja', 'custom', '{"emoji": "🦉"}'),
('grim-reaper', 'Ceifador', 'custom', '{"emoji": "💀"}'),
('frankenstein', 'Frankenstein', 'custom', '{"emoji": "🧟‍♂️"}'),
('vampire', 'Vampiro', 'custom', '{"emoji": "🧛"}'),
('potion-bottle', 'Frasco de Poção', 'custom', '{"emoji": "🧪"}');