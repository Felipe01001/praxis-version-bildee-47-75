/**
 * Utility to clear all cached data and force fresh load of global settings
 */

export const clearAllCaches = () => {
  try {
    // Clear localStorage theme settings
    const keysToRemove = [
      'praxis-header-color',
      'praxis-avatar-color', 
      'praxis-text-color',
      'praxis-main-color',
      'praxis-button-color',
      'praxis-case-status-colors',
      'praxis-task-status-colors',
      'praxis-status-view',
      'theme-settings'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Clear sessionStorage 
    sessionStorage.clear();

    // Force page reload to get fresh data
    window.location.reload();
    
    console.log('✅ Cache cleared successfully');
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return false;
  }
};

export const resetToGlobalDefaults = () => {
  try {
    // Set global defaults
    localStorage.setItem('praxis-header-color', '#838580');
    localStorage.setItem('praxis-avatar-color', '#F5A65B');
    localStorage.setItem('praxis-text-color', 'text-gray-800');
    localStorage.setItem('praxis-main-color', '#F3F4F6');
    localStorage.setItem('praxis-button-color', '#6CAE75');
    localStorage.setItem('praxis-case-status-colors', JSON.stringify({
      'open': '#61a0ff',
      'completed': '#c2ff61'
    }));
    localStorage.setItem('praxis-task-status-colors', JSON.stringify({
      'in-progress': '#6da7fd',
      'delayed': '#ff8785',
      'completed': '#c0ff5c'
    }));
    localStorage.setItem('praxis-status-view', 'cases');

    console.log('✅ Reset to global defaults');
    window.location.reload();
  } catch (error) {
    console.error('❌ Error resetting to defaults:', error);
  }
};