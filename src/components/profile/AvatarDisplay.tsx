import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCustomIcons } from '@/hooks/useCustomIcons';
import * as LucideIcons from 'lucide-react';

interface AvatarDisplayProps {
  avatarType: string;
  avatarData: {
    color?: string;
    character?: string;
    url?: string;
    icon?: string;
  };
  fullName: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarDisplay = ({ 
  avatarType, 
  avatarData, 
  fullName, 
  size = 'md' 
}: AvatarDisplayProps) => {
  const { getAllAvailableIcons } = useCustomIcons();

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

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20'
  };

  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-9 w-9',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  const renderAvatar = () => {
    if ((avatarType === 'upload' || avatarType === 'uploaded') && avatarData.url) {
      return <AvatarImage src={avatarData.url} alt={`Avatar de ${fullName}`} />;
    }
    
    if (avatarType === 'icon' && avatarData.icon) {
      const availableIcons = getAllAvailableIcons();
      const IconComponent = availableIcons.find(icon => icon.id === avatarData.icon)?.icon;
      
      if (IconComponent) {
        return (
          <AvatarFallback 
            className="text-white bg-transparent"
            style={{ backgroundColor: 'transparent' }}
          >
            <IconComponent className="h-full w-full" />
          </AvatarFallback>
        );
      }
    }
    
    return (
      <AvatarFallback 
        className={`text-white font-semibold ${textSizeClasses[size]}`}
        style={{ backgroundColor: avatarData.color || '#8B9474' }}
      >
        {getInitials()}
      </AvatarFallback>
    );
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {renderAvatar()}
    </Avatar>
  );
};