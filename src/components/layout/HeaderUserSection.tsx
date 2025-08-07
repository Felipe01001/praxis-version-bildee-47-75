
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCustomIcons } from "@/hooks/useCustomIcons";

const HeaderUserSection = () => {
  const { user, signOut } = useAuth();
  const { avatarColor } = useTheme();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<any>(null);
  const { getAllAvailableIcons } = useCustomIcons();

  // Load user profile for avatar data
  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('avatar_type, avatar_data')
        .eq('user_id', user?.id)
        .single();
      
      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading user profile for avatar:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth/login");
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.full_name) {
      const nameParts = user.user_metadata.full_name.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
      }
      return nameParts[0][0].toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const getAvatarContent = () => {
    // Check for uploaded avatar first
    if (user?.user_metadata?.avatar_url) {
      return <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata?.full_name || "Avatar"} />;
    }

    // Check user profile data
    if (userProfile) {
      const { avatar_type, avatar_data } = userProfile;
      
      if (avatar_type === 'icon' && avatar_data?.icon) {
        const availableIcons = getAllAvailableIcons();
        const IconComponent = availableIcons.find(icon => icon.id === avatar_data.icon)?.icon;
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
      
      if (avatar_type === 'predefined' && avatar_data?.url) {
        return <AvatarImage src={avatar_data.url} alt="Avatar" />;
      }
      
      if (avatar_type === 'initials' || !avatar_type) {
        return (
          <AvatarFallback
            className="text-white"
            style={{ backgroundColor: avatar_data?.color || avatarColor }}
          >
            {getUserInitials()}
          </AvatarFallback>
        );
      }
    }

    // Fallback to default
    return (
      <AvatarFallback
        className="text-white"
        style={{ backgroundColor: avatarColor }}
      >
        {getUserInitials()}
      </AvatarFallback>
    );
  };

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => navigate("/auth/login")} className="text-white">
          Entrar
        </Button>
        <Button onClick={() => navigate("/auth/signup")} className="bg-white text-praxis-olive hover:bg-white/90">
          Cadastrar
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar>
            {getAvatarContent()}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || "Usuário"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/change-password")}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Alterar senha</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HeaderUserSection;
