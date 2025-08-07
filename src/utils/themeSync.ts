// Theme synchronization utilities
import { supabase } from '@/integrations/supabase/client';

interface ThemeSettings {
  headerColor?: string;
  avatarColor?: string;
  textColor?: string;
  mainColor?: string;
  buttonColor?: string;
  caseStatusColors?: Record<string, string>;
  taskStatusColors?: Record<string, string>;
}

/**
 * Loads theme settings from database or localStorage fallback
 */
export async function loadThemeSettings(): Promise<ThemeSettings> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return loadThemeFromLocalStorage();
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('theme_settings')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading theme settings:', error);
      return loadThemeFromLocalStorage();
    }

    return (profile?.theme_settings as ThemeSettings) || loadThemeFromLocalStorage();
  } catch (error) {
    console.error('Error loading theme settings:', error);
    return loadThemeFromLocalStorage();
  }
}

/**
 * Saves theme settings to both database and localStorage
 */
export async function saveThemeSettings(settings: ThemeSettings): Promise<boolean> {
  try {
    // Save to localStorage first (always works)
    saveThemeToLocalStorage(settings);

    // Try to save to database
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return true; // Settings saved to localStorage at least
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({ theme_settings: settings as any })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error saving theme settings to database:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving theme settings:', error);
    return false;
  }
}

/**
 * Loads theme settings from localStorage
 */
function loadThemeFromLocalStorage(): ThemeSettings {
  const defaultSettings: ThemeSettings = {
    headerColor: '#8B9474',
    avatarColor: '#F5A65B',
    textColor: 'text-white',
    mainColor: '#F3F4F6',
    buttonColor: '#8B9474',
    caseStatusColors: {
      'open': '#D3E4FD',
      'completed': '#F2FCE2'
    },
    taskStatusColors: {
      'in-progress': '#D3E4FD',
      'delayed': '#FFCCCB',
      'completed': '#F2FCE2'
    }
  };

  try {
    const settings: ThemeSettings = {
      headerColor: localStorage.getItem('praxis-header-color') || defaultSettings.headerColor,
      avatarColor: localStorage.getItem('praxis-avatar-color') || defaultSettings.avatarColor,
      textColor: localStorage.getItem('praxis-text-color') || defaultSettings.textColor,
      mainColor: localStorage.getItem('praxis-main-color') || defaultSettings.mainColor,
      buttonColor: localStorage.getItem('praxis-button-color') || defaultSettings.buttonColor,
    };

    // Load status colors
    const storedCaseColors = localStorage.getItem('praxis-case-status-colors');
    settings.caseStatusColors = storedCaseColors 
      ? JSON.parse(storedCaseColors) 
      : defaultSettings.caseStatusColors;

    const storedTaskColors = localStorage.getItem('praxis-task-status-colors');
    settings.taskStatusColors = storedTaskColors 
      ? JSON.parse(storedTaskColors) 
      : defaultSettings.taskStatusColors;

    return settings;
  } catch (error) {
    console.error('Error loading theme from localStorage:', error);
    return defaultSettings;
  }
}

/**
 * Saves theme settings to localStorage
 */
function saveThemeToLocalStorage(settings: ThemeSettings): void {
  try {
    if (settings.headerColor) {
      localStorage.setItem('praxis-header-color', settings.headerColor);
    }
    if (settings.avatarColor) {
      localStorage.setItem('praxis-avatar-color', settings.avatarColor);
    }
    if (settings.textColor) {
      localStorage.setItem('praxis-text-color', settings.textColor);
    }
    if (settings.mainColor) {
      localStorage.setItem('praxis-main-color', settings.mainColor);
    }
    if (settings.buttonColor) {
      localStorage.setItem('praxis-button-color', settings.buttonColor);
    }
    if (settings.caseStatusColors) {
      localStorage.setItem('praxis-case-status-colors', JSON.stringify(settings.caseStatusColors));
    }
    if (settings.taskStatusColors) {
      localStorage.setItem('praxis-task-status-colors', JSON.stringify(settings.taskStatusColors));
    }
  } catch (error) {
    console.error('Error saving theme to localStorage:', error);
  }
}

/**
 * Applies CSS variables for theming
 */
export function applyThemeToDOM(settings: ThemeSettings): void {
  const root = document.documentElement;
  
  if (settings.headerColor) {
    root.style.setProperty('--header-bg', settings.headerColor);
  }
  
  if (settings.avatarColor) {
    root.style.setProperty('--avatar-bg', settings.avatarColor);
  }
  
  if (settings.mainColor) {
    root.style.setProperty('--main-bg', settings.mainColor);
  }
  
  if (settings.buttonColor) {
    root.style.setProperty('--button-bg', settings.buttonColor);
  }
}

/**
 * Validates if current theme settings are consistent
 */
export function validateThemeConsistency(): Promise<boolean> {
  return new Promise(async (resolve) => {
    try {
      const dbSettings = await loadThemeSettings();
      const localSettings = loadThemeFromLocalStorage();
      
      // Check if settings match
      const isConsistent = JSON.stringify(dbSettings) === JSON.stringify(localSettings);
      
      if (!isConsistent) {
        console.warn('Theme settings inconsistency detected');
        // Sync database settings to localStorage
        saveThemeToLocalStorage(dbSettings);
        applyThemeToDOM(dbSettings);
      }
      
      resolve(isConsistent);
    } catch (error) {
      console.error('Error validating theme consistency:', error);
      resolve(false);
    }
  });
}