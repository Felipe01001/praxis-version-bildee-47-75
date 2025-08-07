import { ReactNode, useState, useEffect } from 'react';
import CustomHeader from './CustomHeader';
import Sidebar from './Sidebar';
import { ThemeProvider } from '@/context/ThemeContext';
import { useTheme } from '@/context/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
interface LayoutProps {
  children: ReactNode;
}
const LayoutContent = ({
  children
}: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const {
    mainColor,
    headerColor,
    buttonColor
  } = useTheme();
  const isMobile = useIsMobile();
  const isMediumScreen = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  // Auto-collapse sidebar on medium screens
  useEffect(() => {
    if (isMediumScreen) {
      setSidebarOpen(false);
    } else if (!isMobile) {
      setSidebarOpen(true);
    }
  }, [isMobile, isMediumScreen]);
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  // Apply theme colors as CSS variables
  useEffect(() => {
    // Convert hex to HSL for CSS variables
    const hexToHsl = (hex: string): string => {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
      const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
      const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
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

    const buttonHsl = hexToHsl(buttonColor);
    document.documentElement.style.setProperty('--theme-color', `hsl(${buttonHsl})`);
    document.documentElement.style.setProperty('--theme-color-hover', `hsl(${buttonHsl})`);
    document.documentElement.style.setProperty('--main-bg', mainColor);
  }, [buttonColor, mainColor]);

  return <div className="flex flex-col h-screen">
      <CustomHeader toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main style={{
        backgroundColor: mainColor
      }} className="flex-1 overflow-y-auto p-6 px-[8px]">
          {children}
        </main>
      </div>
    </div>;
};

// Hook for responsive media queries
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
};
const Layout = ({
  children
}: LayoutProps) => {
  return <ThemeProvider>
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>;
};
export default Layout;