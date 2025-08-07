import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import * as LucideIcons from 'lucide-react';
import React from 'react';

export interface CustomIcon {
  id: string;
  user_id: string;
  icon_id: string;
  icon_name: string;
  icon_type: string;
  icon_data?: any;
  created_at: string;
  updated_at: string;
}

export interface UploadedIcon {
  id: string;
  user_id: string;
  icon_name: string;
  file_path: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
  created_at: string;
  updated_at: string;
}

export const useCustomIcons = () => {
  const [customIcons, setCustomIcons] = useState<CustomIcon[]>([]);
  const [globalIcons, setGlobalIcons] = useState<any[]>([]);
  const [uploadedIcons, setUploadedIcons] = useState<UploadedIcon[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch all custom icons (global access)
  const fetchCustomIcons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_custom_icons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomIcons(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar ícones",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch global icons
  const fetchGlobalIcons = async () => {
    try {
      const { data, error } = await supabase
        .from('global_icons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGlobalIcons(data || []);
    } catch (error: any) {
      console.error('Error loading global icons:', error);
    }
  };

  // Fetch all uploaded icons (global access)
  const fetchUploadedIcons = async () => {
    try {
      const { data, error } = await supabase
        .from('user_uploaded_icons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploadedIcons(data || []);
    } catch (error: any) {
      console.error('Error loading uploaded icons:', error);
    }
  };

  // Add new custom icon
  const addCustomIcon = async (iconId: string, iconName: string, iconType: string = 'lucide', iconData?: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_custom_icons')
        .insert({
          user_id: user.id,
          icon_id: iconId,
          icon_name: iconName,
          icon_type: iconType,
          icon_data: iconData
        })
        .select()
        .single();

      if (error) throw error;

      setCustomIcons(prev => [data, ...prev]);
      toast({
        title: "Ícone adicionado",
        description: "Ícone personalizado adicionado com sucesso!",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar ícone",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update custom icon
  const updateCustomIcon = async (id: string, updates: Partial<CustomIcon>) => {
    try {
      const { data, error } = await supabase
        .from('user_custom_icons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setCustomIcons(prev => prev.map(icon => icon.id === id ? data : icon));
      toast({
        title: "Ícone atualizado",
        description: "Ícone personalizado atualizado com sucesso!",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar ícone",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete custom icon
  const deleteCustomIcon = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_custom_icons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomIcons(prev => prev.filter(icon => icon.id !== id));
      toast({
        title: "Ícone removido",
        description: "Ícone personalizado removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover ícone",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Upload icon file
  const uploadIconFile = async (file: File, iconName?: string) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('User not authenticated');

      // Extract file name without extension
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      const finalIconName = iconName || fileNameWithoutExt;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Save to database
      const { data, error } = await supabase
        .from('user_uploaded_icons')
        .insert({
          user_id: user.id,
          icon_name: finalIconName,
          file_path: filePath,
          file_url: urlData.publicUrl,
          file_size: file.size,
          mime_type: file.type
        })
        .select()
        .single();

      if (error) throw error;

      setUploadedIcons(prev => [data, ...prev]);
      toast({
        title: "Ícone enviado",
        description: "Ícone foi enviado e salvo com sucesso!",
      });
      
      return data;
    } catch (error: any) {
      toast({
        title: "Erro ao enviar ícone",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete uploaded icon
  const deleteUploadedIcon = async (id: string) => {
    try {
      // Get icon data first
      const iconToDelete = uploadedIcons.find(icon => icon.id === id);
      if (!iconToDelete) throw new Error('Ícone não encontrado');

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove([iconToDelete.file_path]);

      if (storageError) console.warn('Erro ao deletar arquivo do storage:', storageError);

      // Delete from database
      const { error } = await supabase
        .from('user_uploaded_icons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setUploadedIcons(prev => prev.filter(icon => icon.id !== id));
      toast({
        title: "Ícone removido",
        description: "Ícone enviado foi removido com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao remover ícone",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Get all available icons (global + uploaded only)
  const getAllAvailableIcons = () => {

    // Add global icons (special themed icons available to all users)
    const globalIconsFormatted = globalIcons.map(globalIcon => {
      // Handle image-type global icons
      if (globalIcon.icon_data?.type === 'image') {
        const ImageIcon = ({ className }: { className?: string }) => React.createElement('img', { 
          src: globalIcon.icon_data.file_url, 
          alt: globalIcon.icon_name,
          className: className || 'w-full h-full object-cover'
        });
        return {
          id: globalIcon.icon_id,
          name: globalIcon.icon_name,
          icon: ImageIcon,
          type: 'global',
          customData: globalIcon
        };
      }
      
      // Handle emoji-type global icons (existing functionality)
      const EmojiIcon = ({ className }: { className?: string }) => React.createElement('span', { className: className || 'text-xl' }, globalIcon.icon_data?.emoji);
      return {
        id: globalIcon.icon_id,
        name: globalIcon.icon_name,
        icon: EmojiIcon,
        type: 'global',
        customData: globalIcon
      };
    });

    // Add uploaded icons
    const uploadedIconsFormatted = uploadedIcons.map(uploadedIcon => {
      const ImageIcon = ({ className }: { className?: string }) => React.createElement('img', { 
        src: uploadedIcon.file_url, 
        alt: uploadedIcon.icon_name,
        className: className || 'w-full h-full object-cover'
      });
      return {
        id: uploadedIcon.id,
        name: uploadedIcon.icon_name,
        icon: ImageIcon,
        type: 'uploaded',
        customData: uploadedIcon
      };
    });

    return [...globalIconsFormatted, ...uploadedIconsFormatted];
  };

  useEffect(() => {
    fetchCustomIcons();
    fetchGlobalIcons();
    fetchUploadedIcons();
  }, []);

  return {
    customIcons,
    globalIcons,
    uploadedIcons,
    loading,
    addCustomIcon,
    updateCustomIcon,
    deleteCustomIcon,
    uploadIconFile,
    deleteUploadedIcon,
    getAllAvailableIcons,
    refetch: () => {
      fetchCustomIcons();
      fetchGlobalIcons();
      fetchUploadedIcons();
    }
  };
};