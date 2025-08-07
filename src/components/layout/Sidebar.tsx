import { Link, useLocation } from 'react-router-dom';
import { Calendar, ChevronLeft, Folder, Home, Plus, Search, User, FileText, Settings, Palette, CheckCircle, File, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { STATUS_LABELS } from '@/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/context/ThemeContext';
import { SubscriptionAccessWrapper } from '@/components/subscription/SubscriptionAccessWrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}
const Sidebar = ({
  isOpen = false,
  onClose
}: SidebarProps) => {
  const location = useLocation();
  const {
    headerColor,
    textColor,
    caseStatusColors,
    taskStatusColors,
    setCaseStatusColor,
    setTaskStatusColor,
    currentStatusView,
    setCurrentStatusView
  } = useTheme();
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  const navigationItems = [{
    name: 'Dashboard',
    path: '/',
    icon: <Home className="h-5 w-5" />
  }, {
    name: 'Clientes',
    path: '/clients',
    icon: <User className="h-5 w-5" />
  }, {
    name: 'Atendimentos',
    path: '/cases',
    icon: <Folder className="h-5 w-5" />
  }, {
    name: 'Processos Judiciais',
    path: '/judicial-processes',
    icon: <FileText className="h-5 w-5" />
  }, {
    name: 'Tarefas',
    path: '/tasks',
    icon: <CheckCircle className="h-5 w-5" />
  }, {
    name: 'Petições',
    path: '/petitions',
    icon: <File className="h-5 w-5" />
  }, {
    name: 'Legislação',
    path: '/legislation',
    icon: <Scale className="h-5 w-5" />
  }, {
    name: 'Agenda',
    path: '/calendar',
    icon: <Calendar className="h-5 w-5" />
  }, {
    name: 'Busca',
    path: '/search',
    icon: <Search className="h-5 w-5" />
  }];

  // Apply conditional classes based on isOpen prop for mobile
  const sidebarClasses = cn(`${textColor} w-64 flex flex-col h-screen`, "md:relative",
  // Always visible on desktop
  isOpen ? "fixed inset-y-0 left-0 z-30" : "hidden md:flex" // Conditional for mobile
  );

  // Get the current status colors based on the view
  const currentStatusColors = currentStatusView === 'cases' ? caseStatusColors : taskStatusColors;

  // Handle color change
  const handleColorChange = (status: string, color: string) => {
    if (currentStatusView === 'cases') {
      setCaseStatusColor(status as keyof typeof caseStatusColors, color);
    } else {
      setTaskStatusColor(status as keyof typeof taskStatusColors, color);
    }
  };

  // Get automatic text color based on background color
  const getTextColor = (bgColor: string) => {
    // Check if color is light or dark
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
  };
  return <aside className={sidebarClasses} style={{
    backgroundColor: headerColor
  }}>
      <div className="flex items-center justify-between p-4 py-[4px]">
        <Link to="/" className={`text-2xl font-bold ${textColor}`}>
          Praxis
        </Link>
        
        {/* Close button - only visible on mobile when sidebar is open */}
        <Button variant="ghost" size="icon" onClick={onClose} className={textColor}>
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Fechar menu</span>
        </Button>
      </div>
      
      <SubscriptionAccessWrapper action="criar um novo cliente">
        <div className="mx-4 mb-6">
          <Button asChild className="w-full theme-primary-button">
            <Link to="/clients/new" className="flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Novo Cliente</span>
            </Link>
          </Button>
        </div>
      </SubscriptionAccessWrapper>
      
      <ScrollArea className="flex-1 px-4 pb-12 h-0 overflow-y-auto">
        <nav className="flex flex-col gap-2 mb-6">
          {navigationItems.map(item => {
          return <Link key={item.path} to={item.path} className={cn("flex items-center gap-3 px-4 py-3 rounded-md transition-colors", isActive(item.path) ? "bg-white/20 text-white" : `hover:bg-white/10 ${textColor}`)}>
                {item.icon}
                <span>{item.name}</span>
              </Link>;
        })}
        </nav>
        
        <div className="border-t border-white/20 pt-4 mb-6">
          <div className="px-2 py-0">
            <div className="flex items-center justify-between">
              <h4 className={`font-medium ${textColor}`}>Personalizar Tema</h4>
              <Button variant="ghost" size="icon" className={`${textColor} hover:bg-white/10 h-7 w-7`}>
                <Palette className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs defaultValue="cases" value={currentStatusView} onValueChange={value => setCurrentStatusView(value as 'cases' | 'tasks')} className="mt-4">
              <TabsList className="w-full grid grid-cols-2 bg-white/10">
                <TabsTrigger value="cases" className={`${textColor} data-[state=active]:bg-white/20`}>Atendimentos</TabsTrigger>
                <TabsTrigger value="tasks" className={`${textColor} data-[state=active]:bg-white/20`}>Tarefas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cases" className="mt-4 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-2">
                    <span className={`text-xs uppercase font-medium ${textColor}`}>Em Aberto</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: caseStatusColors['open']
                      }}></div>
                        <span className={textColor}>Em Aberto</span>
                      </div>
                      <label className={`text-xs ${textColor}`}>Cor:</label>
                      <Input type="color" value={caseStatusColors['open']} onChange={e => handleColorChange('open', e.target.value)} className="w-full h-6 p-0 cursor-pointer" />
                      <div className="text-xs text-white/70 mt-1">Cor do texto: automática</div>
                    </div>
                  </div>
                  
                  <Separator className="bg-white/20" />
                  
                  <div className="flex flex-col gap-2">
                    <span className={`text-xs uppercase font-medium ${textColor}`}>Finalizado</span>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{
                        backgroundColor: caseStatusColors['completed']
                      }}></div>
                        <span className={textColor}>Finalizado</span>
                      </div>
                      <label className={`text-xs ${textColor}`}>Cor:</label>
                      <Input type="color" value={caseStatusColors['completed']} onChange={e => handleColorChange('completed', e.target.value)} className="w-full h-6 p-0 cursor-pointer" />
                      <div className="text-xs text-white/70 mt-1">Cor do texto: automática</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="tasks" className="mt-4 space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: taskStatusColors['in-progress']
                    }}></div>
                      <span className={textColor}>Em Andamento</span>
                    </div>
                    <Input type="color" value={taskStatusColors['in-progress']} onChange={e => handleColorChange('in-progress', e.target.value)} className="w-full h-6 p-0 cursor-pointer" />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: taskStatusColors['delayed']
                    }}></div>
                      <span className={textColor}>Atrasado</span>
                    </div>
                    <Input type="color" value={taskStatusColors['delayed']} onChange={e => handleColorChange('delayed', e.target.value)} className="w-full h-6 p-0 cursor-pointer" />
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{
                      backgroundColor: taskStatusColors['completed']
                    }}></div>
                      <span className={textColor}>Concluído</span>
                    </div>
                    <Input type="color" value={taskStatusColors['completed']} onChange={e => handleColorChange('completed', e.target.value)} className="w-full h-6 p-0 cursor-pointer" />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScrollArea>
    </aside>;
};
export default Sidebar;