import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { STATUS_COLORS } from '@/constants';
import { Status } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Type for case status colors (only 2 statuses)
type CaseStatusColorsType = {
  open: string;
  completed: string;
};

// Type for task status colors (3 statuses)
type TaskStatusColorsType = {
  'in-progress': string;
  delayed: string;
  completed: string;
};

// Type for theme settings from database
type ThemeSettings = {
  headerColor?: string;
  avatarColor?: string;
  textColor?: string;
  mainColor?: string;
  buttonColor?: string;
  caseStatusColors?: CaseStatusColorsType;
  taskStatusColors?: TaskStatusColorsType;
};

interface ThemeContextProps {
  headerColor: string;
  setHeaderColor: (color: string) => void;
  avatarColor: string;
  setAvatarColor: (color: string) => void;
  textColor: string; 
  setTextColor: (color: string) => void;
  mainColor: string;
  setMainColor: (color: string) => void;
  buttonColor: string;
  setButtonColor: (color: string) => void;
  caseStatusColors: CaseStatusColorsType;
  setCaseStatusColor: (status: keyof CaseStatusColorsType, color: string) => void;
  taskStatusColors: TaskStatusColorsType;
  setTaskStatusColor: (status: keyof TaskStatusColorsType, color: string) => void;
  currentStatusView: 'cases' | 'tasks';
  setCurrentStatusView: (view: 'cases' | 'tasks') => void;
}

// Default color values for case status - only 2 statuses
const DEFAULT_CASE_STATUS_COLORS: CaseStatusColorsType = {
  'open': '#D3E4FD', // Soft Blue
  'completed': '#F2FCE2', // Soft Green
};

// Default color values for task status - 3 statuses
const DEFAULT_TASK_STATUS_COLORS: TaskStatusColorsType = {
  'in-progress': '#D3E4FD', // Soft Blue
  'delayed': '#FFCCCB', // Red for delayed
  'completed': '#F2FCE2', // Soft Green
};

// Function to automatically determine text color based on background color
const getTextColorFromBackground = (bgColor: string): string => {
  return isLightColor(bgColor) ? '#1a1a1a' : '#ffffff';
};

// Helper function to convert HEX to HSL
const hexToHsl = (hex: string): string => {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

// Check if a color is light or dark
export const isLightColor = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance - using the formula for relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if light, false if dark
  return luminance > 0.5;
};

const ThemeContext = createContext<ThemeContextProps>({
  headerColor: '#8B9474',
  setHeaderColor: () => {},
  avatarColor: '#F5A65B',
  setAvatarColor: () => {},
  textColor: 'text-white',
  setTextColor: () => {},
  mainColor: '#F3F4F6',
  setMainColor: () => {},
  buttonColor: '#8B9474',
  setButtonColor: () => {},
  caseStatusColors: DEFAULT_CASE_STATUS_COLORS,
  setCaseStatusColor: () => {},
  taskStatusColors: DEFAULT_TASK_STATUS_COLORS,
  setTaskStatusColor: () => {},
  currentStatusView: 'cases',
  setCurrentStatusView: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [headerColor, setHeaderColorState] = useState<string>('#8B9474');
  const [avatarColor, setAvatarColorState] = useState<string>('#F5A65B');
  const [textColor, setTextColorState] = useState<string>('text-white');
  const [mainColor, setMainColorState] = useState<string>('#F3F4F6');
  const [buttonColor, setButtonColorState] = useState<string>('#8B9474');
  const [caseStatusColors, setCaseStatusColorsState] = useState<CaseStatusColorsType>(DEFAULT_CASE_STATUS_COLORS);
  const [taskStatusColors, setTaskStatusColorsState] = useState<TaskStatusColorsType>(DEFAULT_TASK_STATUS_COLORS);
  const [currentStatusView, setCurrentStatusViewState] = useState<'cases' | 'tasks'>('cases');
  const [initialized, setInitialized] = useState(false);

  // Load theme settings with improved error handling and consistency validation
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // Load from localStorage if not authenticated
          loadFromLocalStorage();
          setInitialized(true);
          return;
        }

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('theme_settings')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading theme settings:', error);
          toast({
            title: "Erro ao carregar configurações de tema",
            description: "Usando configurações locais como fallback.",
            variant: "destructive"
          });
          loadFromLocalStorage();
          setInitialized(true);
          return;
        }

        if (profile?.theme_settings) {
          const settings = profile.theme_settings as ThemeSettings;
          // Apply settings with validation
          setHeaderColorState(settings.headerColor || '#8B9474');
          setAvatarColorState(settings.avatarColor || '#F5A65B');
          setTextColorState(settings.textColor || 'text-white');
          setMainColorState(settings.mainColor || '#F3F4F6');
          setButtonColorState(settings.buttonColor || '#8B9474');
          setCaseStatusColorsState(settings.caseStatusColors || DEFAULT_CASE_STATUS_COLORS);
          setTaskStatusColorsState(settings.taskStatusColors || DEFAULT_TASK_STATUS_COLORS);
          
          // Also save to localStorage for consistency
          saveToLocalStorage(settings);
        } else {
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading theme settings:', error);
        toast({
          title: "Erro no sistema de temas",
          description: "Usando configurações padrão.",
          variant: "destructive"
        });
        loadFromLocalStorage();
      }
      setInitialized(true);
    };

    loadThemeSettings();
  }, [toast]);

  const loadFromLocalStorage = () => {
    setHeaderColorState(localStorage.getItem('praxis-header-color') || '#8B9474');
    setAvatarColorState(localStorage.getItem('praxis-avatar-color') || '#F5A65B');
    const storedHeaderColor = localStorage.getItem('praxis-header-color') || '#8B9474';
    setTextColorState(isLightColor(storedHeaderColor) ? 'text-gray-800' : 'text-white');
    setMainColorState(localStorage.getItem('praxis-main-color') || '#F3F4F6');
    setButtonColorState(localStorage.getItem('praxis-button-color') || '#8B9474');
    
    const storedCaseColors = localStorage.getItem('praxis-case-status-colors');
    setCaseStatusColorsState(storedCaseColors ? JSON.parse(storedCaseColors) : DEFAULT_CASE_STATUS_COLORS);
    
    const storedTaskColors = localStorage.getItem('praxis-task-status-colors');
    setTaskStatusColorsState(storedTaskColors ? JSON.parse(storedTaskColors) : DEFAULT_TASK_STATUS_COLORS);
    
    setCurrentStatusViewState((localStorage.getItem('praxis-status-view') as 'cases' | 'tasks') || 'cases');
  };

  const saveToLocalStorage = (settings: ThemeSettings) => {
    localStorage.setItem('praxis-header-color', settings.headerColor || headerColor);
    localStorage.setItem('praxis-avatar-color', settings.avatarColor || avatarColor);
    localStorage.setItem('praxis-text-color', settings.textColor || textColor);
    localStorage.setItem('praxis-main-color', settings.mainColor || mainColor);
    localStorage.setItem('praxis-button-color', settings.buttonColor || buttonColor);
    localStorage.setItem('praxis-case-status-colors', JSON.stringify(settings.caseStatusColors || caseStatusColors));
    localStorage.setItem('praxis-task-status-colors', JSON.stringify(settings.taskStatusColors || taskStatusColors));
  };

  const saveThemeToDatabase = async (newSettings: ThemeSettings) => {
    try {
      // Always save to localStorage first
      saveToLocalStorage(newSettings);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return true; // Local save is sufficient for non-authenticated users

      const { error } = await supabase
        .from('user_profiles')
        .update({ theme_settings: newSettings })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving theme settings:', error);
        toast({
          title: "Aviso",
          description: "Configurações salvas localmente. Erro ao sincronizar com a nuvem.",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving theme settings:', error);
      toast({
        title: "Erro ao salvar tema",
        description: "Configurações mantidas apenas localmente.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const setHeaderColor = (color: string) => {
    setHeaderColorState(color);
    localStorage.setItem('praxis-header-color', color);
    const newTextColor = isLightColor(color) ? 'text-gray-800' : 'text-white';
    setTextColorState(newTextColor);
    
    if (initialized) {
      const newSettings = {
        headerColor: color,
        avatarColor,
        textColor: newTextColor,
        mainColor,
        buttonColor,
        caseStatusColors,
        taskStatusColors
      };
      saveThemeToDatabase(newSettings);
    }
  };
  
  const setAvatarColor = (color: string) => {
    setAvatarColorState(color);
    localStorage.setItem('praxis-avatar-color', color);
    
    if (initialized) {
      const newSettings = {
        headerColor,
        avatarColor: color,
        textColor,
        mainColor,
        buttonColor,
        caseStatusColors,
        taskStatusColors
      };
      saveThemeToDatabase(newSettings);
    }
  };

  const setTextColor = (color: string) => {
    setTextColorState(color);
    localStorage.setItem('praxis-text-color', color);
    
    if (initialized) {
      const newSettings = {
        headerColor,
        avatarColor,
        textColor: color,
        mainColor,
        buttonColor,
        caseStatusColors,
        taskStatusColors
      };
      saveThemeToDatabase(newSettings);
    }
  };
  
  const setMainColor = (color: string) => {
    setMainColorState(color);
    localStorage.setItem('praxis-main-color', color);
    
    if (initialized) {
      const newSettings = {
        headerColor,
        avatarColor,
        textColor,
        mainColor: color,
        buttonColor,
        caseStatusColors,
        taskStatusColors
      };
      saveThemeToDatabase(newSettings);
    }
  };
  
  const setButtonColor = (color: string) => {
    setButtonColorState(color);
    localStorage.setItem('praxis-button-color', color);
    
    if (initialized) {
      const newSettings = {
        headerColor,
        avatarColor,
        textColor,
        mainColor,
        buttonColor: color,
        caseStatusColors,
        taskStatusColors
      };
      saveThemeToDatabase(newSettings);
    }
  };
  
  const setCaseStatusColor = (status: keyof CaseStatusColorsType, color: string) => {
    const newColors = { ...caseStatusColors, [status]: color };
    setCaseStatusColorsState(newColors);
    localStorage.setItem('praxis-case-status-colors', JSON.stringify(newColors));
    
    if (initialized) {
      const newSettings = {
        headerColor,
        avatarColor,
        textColor,
        mainColor,
        buttonColor,
        caseStatusColors: newColors,
        taskStatusColors
      };
      saveThemeToDatabase(newSettings);
    }
  };
  
  const setTaskStatusColor = (status: keyof TaskStatusColorsType, color: string) => {
    const newColors = { ...taskStatusColors, [status]: color };
    setTaskStatusColorsState(newColors);
    localStorage.setItem('praxis-task-status-colors', JSON.stringify(newColors));
    
    if (initialized) {
      const newSettings = {
        headerColor,
        avatarColor,
        textColor,
        mainColor,
        buttonColor,
        caseStatusColors,
        taskStatusColors: newColors
      };
      saveThemeToDatabase(newSettings);
    }
  };
  
  const setCurrentStatusView = (view: 'cases' | 'tasks') => {
    setCurrentStatusViewState(view);
    localStorage.setItem('praxis-status-view', view);
  };
  
  return (
    <ThemeContext.Provider
      value={{
        headerColor,
        setHeaderColor,
        avatarColor,
        setAvatarColor,
        textColor,
        setTextColor,
        mainColor,
        setMainColor,
        buttonColor,
        setButtonColor,
        caseStatusColors,
        setCaseStatusColor,
        taskStatusColors,
        setTaskStatusColor,
        currentStatusView,
        setCurrentStatusView,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
