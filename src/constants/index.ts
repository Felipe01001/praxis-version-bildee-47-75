
import { Category, SubCategory, CaseStatus, TaskStatus, ClientStatus } from '@/types';

// Opções para gênero
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
  { value: 'non-binary', label: 'Não binário' },
  { value: 'other', label: 'Outro' }
];

// Opções para estado civil
export const MARITAL_STATUS_OPTIONS = [
  { value: 'single', label: 'Solteiro(a)' },
  { value: 'married', label: 'Casado(a)' },
  { value: 'divorced', label: 'Divorciado(a)' },
  { value: 'widowed', label: 'Viúvo(a)' },
  { value: 'stable-union', label: 'União estável' },
  { value: 'legally-separated', label: 'Separado(a) judicialmente' }
];

// Rótulos para categorias
export const CATEGORY_LABELS: Record<Category, string> = {
  'social-security': 'Previdenciário',
  'criminal': 'Criminal',
  'civil': 'Cível',
  'labor': 'Trabalhista',
  'administrative': 'Administrativo'
};

// Subcategorias por categoria
export const SUBCATEGORIES: Record<Category, { value: SubCategory; label: string }[]> = {
  'social-security': [
    { value: 'retirement', label: 'Aposentadoria' },
    { value: 'disability', label: 'Auxílio-doença/BPC' },
    { value: 'maternity', label: 'Salário-maternidade' },
    { value: 'sickness', label: 'Auxílio-doença' },
    { value: 'accident', label: 'Auxílio-acidente' },
    { value: 'pension', label: 'Pensão por morte' },
    { value: 'benefit-review', label: 'Revisão de benefício' },
    { value: 'other-social', label: 'Outro' }
  ],
  'criminal': [
    { value: 'theft', label: 'Furto' },
    { value: 'robbery', label: 'Roubo' },
    { value: 'drug-traffic', label: 'Tráfico de drogas' },
    { value: 'homicide', label: 'Homicídio' },
    { value: 'misdemeanor', label: 'Contravenção penal' },
    { value: 'fraud', label: 'Estelionato' },
    { value: 'domestic-violence', label: 'Violência doméstica' },
    { value: 'other-criminal', label: 'Outro' }
  ],
  'civil': [],
  'labor': [], 
  'administrative': []
};

// Rótulos para status de atendimentos (cases)
export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  'open': 'Em Aberto',
  'completed': 'Finalizado'
};

// Rótulos para status de tarefas (tasks)
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  'in-progress': 'Em Andamento',
  'delayed': 'Atrasado',
  'completed': 'Concluído'
};

// Mantém compatibilidade
export const STATUS_LABELS = CASE_STATUS_LABELS;

// Rótulos para status de clientes
export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  'active': 'Ativo',
  'inactive': 'Inativo',
  'pending': 'Pendente'
};

// Cores para status de atendimentos (cases)
export const CASE_STATUS_COLORS: Record<CaseStatus, string> = {
  'open': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800'
};

// Cores para status de tarefas (tasks)
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  'in-progress': 'bg-blue-100 text-blue-800',
  'delayed': 'bg-red-100 text-red-800',
  'completed': 'bg-green-100 text-green-800'
};

// Mantém compatibilidade
export const STATUS_COLORS = CASE_STATUS_COLORS;

// Cores para status de clientes
export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  'active': 'bg-green-100 text-green-800',
  'inactive': 'bg-gray-100 text-gray-800',
  'pending': 'bg-amber-100 text-amber-800'
};
