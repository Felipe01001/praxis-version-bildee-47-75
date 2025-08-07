-- Criar tabela para armazenar uploads de ícones do usuário
CREATE TABLE public.user_uploaded_icons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  icon_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_uploaded_icons ENABLE ROW LEVEL SECURITY;

-- Create policies for user uploaded icons
CREATE POLICY "Users can view their own uploaded icons" 
ON public.user_uploaded_icons 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own uploaded icons" 
ON public.user_uploaded_icons 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own uploaded icons" 
ON public.user_uploaded_icons 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own uploaded icons" 
ON public.user_uploaded_icons 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_uploaded_icons_updated_at
BEFORE UPDATE ON public.user_uploaded_icons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Limpar ícones customizados existentes (conforme solicitado)
DELETE FROM public.user_custom_icons;
DELETE FROM public.global_icons;