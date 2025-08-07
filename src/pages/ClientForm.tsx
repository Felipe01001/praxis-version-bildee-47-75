import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { usePraxisContext } from '@/context/PraxisContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Category, Gender, MaritalStatus, ClientStatus } from '@/types';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { InputWithValidation } from '@/components/ui/input-with-validation';
import { validateCPF, validatePhone, validateEmail, validateRequired, formatCPF, formatPhone } from '@/utils/validation';

const ClientForm = () => {
  const navigate = useNavigate();
  const { addClient } = usePraxisContext();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    category: '' as Category,
    phone: '',
    email: '',
    birthDate: '',
    gender: '' as Gender | '',
    maritalStatus: '' as MaritalStatus | '',
    nationality: '',
    profession: '',
    rgNumber: '',
    rgIssuingBody: '',
    addressStreet: '',
    addressNumber: '',
    addressNeighborhood: '',
    addressCity: '',
    addressState: '',
    addressZipCode: '',
    respondentName: '',
    respondentAddress: '',
    respondentCpf: '',
    govPassword: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required field validation
    const nameValidation = validateRequired(formData.name, 'Nome');
    if (!nameValidation.isValid) newErrors.name = nameValidation.error!;
    
    const categoryValidation = validateRequired(formData.category, 'Categoria');
    if (!categoryValidation.isValid) newErrors.category = categoryValidation.error!;
    
    // Optional field validation with enhanced error messages
    if (formData.cpf) {
      const cpfValidation = validateCPF(formData.cpf);
      if (!cpfValidation.isValid) newErrors.cpf = cpfValidation.error!;
    }
    
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) newErrors.phone = phoneValidation.error!;
    }
    
    if (formData.email) {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) newErrors.email = emailValidation.error!;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Você precisa estar logado para cadastrar um cliente');
      navigate('/auth');
      return;
    }
    
    if (!validateForm()) {
      toast.error('Corrija os erros no formulário');
      return;
    }
    
    console.log('Iniciando cadastro de cliente...');
    console.log('Usuário logado:', user.id);
    console.log('Dados do formulário:', formData);
    
    // Format CPF and phone for storage
    let formattedCpf = formData.cpf ? formatCPF(formData.cpf) : '';
    let formattedPhone = formData.phone ? formatPhone(formData.phone) : '';
    
    // Create client object with the form data
    const clientData: any = {
      name: formData.name,
      cpf: formattedCpf || '',
      category: formData.category as Category,
      phone: formattedPhone || null,
      email: formData.email || null,
      birthDate: formData.birthDate || null,
      gender: formData.gender as Gender || null,
      maritalStatus: formData.maritalStatus as MaritalStatus || null,
      nationality: formData.nationality || null,
      profession: formData.profession || null,
      govPassword: formData.govPassword || null,
      status: 'active' as ClientStatus
    };
    
    // Add RG if number exists
    if (formData.rgNumber) {
      clientData.rg = {
        number: formData.rgNumber,
        issuingBody: formData.rgIssuingBody || null
      };
    } else {
      clientData.rg = {
        number: null,
        issuingBody: null
      };
    }
    
    // Add address - ensure all required properties are present
    clientData.address = {
      street: formData.addressStreet || null,
      number: formData.addressNumber || null,
      zipCode: formData.addressZipCode || null,
      neighborhood: formData.addressNeighborhood || null,
      city: formData.addressCity || null,
      state: formData.addressState || null
    };
    
    // Add respondent if we have respondent data
    if (formData.respondentName || formData.respondentAddress || formData.respondentCpf) {
      clientData.respondent = {
        name: formData.respondentName || null,
        address: formData.respondentAddress || null,
        cpf: formData.respondentCpf || null
      };
    }
    
    try {
      console.log('Dados finais para envio:', clientData);
      
      // Add client and get the created client with ID
      const newClient = await addClient(clientData);
      
      console.log('Cliente criado com sucesso:', newClient);
      toast.success('Cliente cadastrado e sincronizado com sucesso!');
      navigate(`/clients/${newClient.id}`);
    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      toast.error('Erro ao cadastrar cliente. Verifique sua conexão e tente novamente.');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Cadastro de Cliente</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-xl font-medium">Dados Básicos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputWithValidation
                  id="name"
                  name="name"
                  label="Nome Completo"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nome completo do cliente"
                  error={errors.name}
                  success={!errors.name && formData.name.trim().length > 0}
                />
                
                <InputWithValidation
                  id="cpf"
                  name="cpf"
                  label="CPF"
                  mask="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  placeholder="000.000.000-00"
                  error={errors.cpf}
                  success={!errors.cpf && formData.cpf.length > 0}
                  helpText="Recomendado para melhor identificação do cliente"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Categoria <span className="text-destructive">*</span>
                  </label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => handleSelectChange('category', value)}
                  >
                    <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="social-security">Previdenciário</SelectItem>
                      <SelectItem value="criminal">Criminal</SelectItem>
                      <SelectItem value="civil">Cível</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-xs text-destructive">{errors.category}</p>
                  )}
                </div>
                
                <InputWithValidation
                  id="phone"
                  name="phone"
                  label="Telefone"
                  mask="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  error={errors.phone}
                  success={!errors.phone && formData.phone.length > 0}
                  helpText="Recomendado para contato com o cliente"
                />
                
                <InputWithValidation
                  id="email"
                  name="email"
                  label="E-mail"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="email@exemplo.com"
                  error={errors.email}
                  success={!errors.email && formData.email.length > 0}
                  helpText="Recomendado para comunicação digital"
                />
              </div>

              <Alert variant="default" className="bg-muted/50 border-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  É recomendado fornecer CPF, telefone e e-mail para melhor identificação e contato com o cliente.
                </AlertDescription>
              </Alert>
            </div>
            
            {/* Botões de ação */}
            <div className="flex justify-end mt-6 gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="bg-praxis-olive hover:bg-praxis-olive/90"
              >
                Cadastrar Cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default ClientForm;
