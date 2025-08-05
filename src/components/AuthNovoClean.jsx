import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiMail, FiPhone, FiLogIn, FiUserPlus, FiLoader, FiFileText, FiCheck } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import LoadingGif from './LoadingGif';
import Regulamento from './Regulamento';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(169, 25, 24, 0.3); }
  50% { box-shadow: 0 0 30px rgba(169, 25, 24, 0.5); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f1f1f1 0%, #e8e8e8 50%, #f1f1f1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Montserrat', sans-serif;
  
  @media (max-width: 768px) {
    padding: 0.5rem;
  }
`;

const AuthCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: white;
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
  border: 1px solid rgba(169, 25, 24, 0.1);
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #A91918, #d32f2f);
  color: white;
  padding: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const Logo = styled.h1`
  font-size: 1.2rem;

  & > img {
    width: 200px;
    filter: invert(50%) contrast(200%) brightness(5);
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const TabContainer = styled.div`
  display: flex;
  background: #f8f9fa;
`;

const Tab = styled.button`
  flex: 1;
  padding: 1rem;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#A91918' : '#6c757d'};
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-bottom: 1px solid ${props => props.$active ? '#A91918' : 'transparent'};
  font-family: 'Montserrat', sans-serif;
  
  &:hover {
    background: ${props => props.$active ? 'white' : '#e9ecef'};
  }
`;

const Form = styled.form`
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  color: #353535;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-family: 'Montserrat', sans-serif;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  font-size: 1rem;
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  border: 1px solid #e9ecef;
  background: white;
  color: #353535;
  font-size: 0.95rem;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.3s ease;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #A91918;
    box-shadow: 0 0 0 3px rgba(169, 25, 24, 0.1);
  }
  
  &::placeholder {
    color: #6c757d;
    font-weight: 400;
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    font-size: 0.9rem;
  }
`;

const Spinner = styled.div`
  width: 18px;
  height: 18px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-top: 1px solid white;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #A91918 0%, #8B1514 100%);
  color: white;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    animation: ${pulseGlow} 2s infinite;
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingSpinner = styled(FiLoader)`
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
`;

const HelpText = styled.div`
  text-align: center;
  color: #6c757d;
  font-size: 0.85rem;
  margin-top: 1rem;
  line-height: 1.4;
  
  small {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const RegulamentoContainer = styled.div`
  margin: 5px 0;
  padding: 15px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 10px;
  
  input[type="checkbox"] {
    margin: 0;
    margin-top: 2px;
    transform: scale(1.1);
    accent-color: #A91918;
    cursor: pointer;
  }
  
  span {
    color: #495057;
    line-height: 1.4;
    font-size: 0.9rem;
  }
`;

const RegulamentoLink = styled.button`
  background: none;
  border: none;
  color: #A91918;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0;
  margin: 0;
  
  &:hover {
    color: #8B1415;
    text-decoration: none;
  }
`;

const AuthNovoClean = ({ onLogin }) => {
    const [activeTab, setActiveTab] = useState('login');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    // Estados para login
    const [loginData, setLoginData] = useState({
        identifier: '', // CPF/CNPJ ou email
        senha: ''
    });

    // Estados para registro
    const [registerData, setRegisterData] = useState({
        nome: '',
        cpf_cnpj: '',
        telefone: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });

    // Estados para regulamento
    const [regulamentoAccepted, setRegulamentoAccepted] = useState(false);
    const [showRegulamento, setShowRegulamento] = useState(false);

    // Funções de formatação
    const formatCPFCNPJ = (value) => {
        const numbers = value.replace(/\D/g, '');

        if (numbers.length <= 11) {
            // CPF: 000.000.000-00
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        } else {
            // CNPJ: 00.000.000/0000-00
            return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
    };

    const formatPhone = (value) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    };

    // Validações
    const validateCPFCNPJ = (value) => {
        const numbers = value.replace(/\D/g, '');
        return numbers.length === 11 || numbers.length === 14;
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Handlers
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            console.log('🔐 Tentando login com:', loginData.identifier);

            // Determinar se é email ou CPF/CNPJ
            const isEmail = loginData.identifier.includes('@');
            const searchField = isEmail ? 'email' : 'cpf_cnpj';

            console.log('🔍 Buscando por:', searchField, '=', loginData.identifier);

            // Buscar usuário
            const { data: userData, error } = await supabase
                .from('clientes_fast')
                .select('*')
                .eq(searchField, loginData.identifier)
                .single();

            if (error || !userData) {
                console.error('❌ Usuário não encontrado:', error);
                setErrors({ identifier: 'Usuário não encontrado' });
                return;
            }

            console.log('✅ Usuário encontrado:', userData.nome);

            // Verificar senha (implementação simples - em produção usar hash)
            if (userData.senha !== loginData.senha) {
                console.error('❌ Senha incorreta');
                setErrors({ senha: 'Senha incorreta' });
                return;
            }

            console.log('✅ Login realizado com sucesso');
            toast.success(`Bem-vindo, ${userData.nome}!`);
            onLogin(userData);

        } catch (error) {
            console.error('❌ Erro no login:', error);
            toast.error('Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            // Validações
            const newErrors = {};

            if (!registerData.nome.trim()) {
                newErrors.nome = 'Nome é obrigatório';
            }

            if (!validateCPFCNPJ(registerData.cpf_cnpj)) {
                newErrors.cpf_cnpj = 'CPF/CNPJ inválido';
            }

            if (!registerData.telefone.trim()) {
                newErrors.telefone = 'Telefone é obrigatório';
            }

            if (registerData.email && !validateEmail(registerData.email)) {
                newErrors.email = 'Email inválido';
            }

            if (registerData.senha.length < 6) {
                newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
            }

            if (registerData.senha !== registerData.confirmarSenha) {
                newErrors.confirmarSenha = 'Senhas não coincidem';
            }

            if (!regulamentoAccepted) {
                newErrors.regulamento = 'É necessário aceitar o regulamento para prosseguir';
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            // Verificar se CPF/CNPJ já existe
            const { data: existingUser } = await supabase
                .from('clientes_fast')
                .select('id')
                .eq('cpf_cnpj', registerData.cpf_cnpj)
                .single();

            if (existingUser) {
                setErrors({ cpf_cnpj: 'CPF/CNPJ já cadastrado' });
                return;
            }

            // Verificar se email já existe (se fornecido)
            if (registerData.email) {
                const { data: existingEmail } = await supabase
                    .from('clientes_fast')
                    .select('id')
                    .eq('email', registerData.email)
                    .single();

                if (existingEmail) {
                    setErrors({ email: 'Email já cadastrado' });
                    return;
                }
            }

            // Criar usuário
            const { data, error } = await supabase
                .from('clientes_fast')
                .insert([{
                    nome: registerData.nome.trim(),
                    cpf_cnpj: registerData.cpf_cnpj,
                    telefone: registerData.telefone,
                    email: registerData.email || null,
                    senha: registerData.senha, // Em produção, usar hash
                    saldo_pontos: 0,
                    total_pontos_ganhos: 0,
                    total_pontos_gastos: 0,
                    role: 'cliente' // Novo usuário sempre começa como cliente
                }])
                .select()
                .single();

            if (error) throw error;

            console.log('✅ Usuário cadastrado:', data);
            toast.success('Cadastro realizado com sucesso!');
            onLogin(data);

        } catch (error) {
            console.error('❌ Erro no cadastro:', error);
            toast.error('Erro ao realizar cadastro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <AuthCard>
                <Header>
                    <Logo><img src="https://imagedelivery.net/1n9Gwvykoj9c9m8C_4GsGA/336e2c64-e66b-487b-d0e5-40df2b33d100/public" alt="" /></Logo>
                    <Subtitle>Clube Fast de Recompensas</Subtitle>
                </Header>

                <TabContainer>
                    <Tab
                        $active={activeTab === 'login'}
                        onClick={() => setActiveTab('login')}
                    >
                        <FiLogIn /> Entrar
                    </Tab>
                    <Tab
                        $active={activeTab === 'register'}
                        onClick={() => setActiveTab('register')}
                    >
                        <FiUserPlus /> Cadastrar
                    </Tab>
                </TabContainer>

                {activeTab === 'login' ? (
                    <Form onSubmit={handleLogin}>
                        <FormGroup>
                            <Label>CPF/CNPJ ou Email</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiUser />
                                </InputIcon>
                                <Input
                                    type="text"
                                    value={loginData.identifier}
                                    onChange={(e) => setLoginData(prev => ({ ...prev, identifier: e.target.value }))}
                                    placeholder="Digite seu CPF/CNPJ ou email"
                                    required
                                />
                            </InputWrapper>
                            {errors.identifier && <ErrorMessage>{errors.identifier}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label>Senha</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiLock />
                                </InputIcon>
                                <Input
                                    type="password"
                                    value={loginData.senha}
                                    onChange={(e) => setLoginData(prev => ({ ...prev, senha: e.target.value }))}
                                    placeholder="Digite sua senha"
                                    required
                                />
                            </InputWrapper>
                            {errors.senha && <ErrorMessage>{errors.senha}</ErrorMessage>}
                        </FormGroup>

                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Spinner />
                                    Entrando...
                                </div>
                            ) : (
                                <>
                                    <FiLogIn />
                                    Entrar
                                </>
                            )}
                        </Button>

                        <HelpText>
                            Não tem conta? Clique em "Cadastrar" acima
                        </HelpText>
                    </Form>
                ) : (
                    <Form onSubmit={handleRegister}>
                        <FormGroup>
                            <Label>Nome Completo *</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiUser />
                                </InputIcon>
                                <Input
                                    type="text"
                                    value={registerData.nome}
                                    onChange={(e) => setRegisterData(prev => ({ ...prev, nome: e.target.value }))}
                                    placeholder="Digite seu nome completo"
                                    required
                                />
                            </InputWrapper>
                            {errors.nome && <ErrorMessage>{errors.nome}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label>CPF ou CNPJ *</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiUser />
                                </InputIcon>
                                <Input
                                    type="text"
                                    value={registerData.cpf_cnpj}
                                    onChange={(e) => setRegisterData(prev => ({ ...prev, cpf_cnpj: formatCPFCNPJ(e.target.value) }))}
                                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                                    required
                                />
                            </InputWrapper>
                            {errors.cpf_cnpj && <ErrorMessage>{errors.cpf_cnpj}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label>Telefone *</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiPhone />
                                </InputIcon>
                                <Input
                                    type="tel"
                                    value={registerData.telefone}
                                    onChange={(e) => setRegisterData(prev => ({ ...prev, telefone: formatPhone(e.target.value) }))}
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                            </InputWrapper>
                            {errors.telefone && <ErrorMessage>{errors.telefone}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label>Email (opcional)</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiMail />
                                </InputIcon>
                                <Input
                                    type="email"
                                    value={registerData.email}
                                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="Digite seu email (opcional)"
                                />
                            </InputWrapper>
                            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label>Senha *</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiLock />
                                </InputIcon>
                                <Input
                                    type="password"
                                    value={registerData.senha}
                                    onChange={(e) => setRegisterData(prev => ({ ...prev, senha: e.target.value }))}
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                />
                            </InputWrapper>
                            {errors.senha && <ErrorMessage>{errors.senha}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label>Confirmar Senha *</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiLock />
                                </InputIcon>
                                <Input
                                    type="password"
                                    value={registerData.confirmarSenha}
                                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmarSenha: e.target.value }))}
                                    placeholder="Confirme sua senha"
                                    required
                                />
                            </InputWrapper>
                            {errors.confirmarSenha && <ErrorMessage>{errors.confirmarSenha}</ErrorMessage>}
                        </FormGroup>

                        <RegulamentoContainer>
                            <CheckboxContainer>
                                <input
                                    type="checkbox"
                                    checked={regulamentoAccepted}
                                    onChange={(e) => setRegulamentoAccepted(e.target.checked)}
                                />
                                <span>
                                    Li e aceito os{' '}
                                    <RegulamentoLink
                                        type="button"
                                        onClick={() => setShowRegulamento(true)}
                                    >
                                        Termos e Condições do Fast Fidelidade
                                    </RegulamentoLink>
                                </span>
                            </CheckboxContainer>

                            {errors.regulamento && <ErrorMessage>{errors.regulamento}</ErrorMessage>}

                        </RegulamentoContainer>

                        <Button type="submit" disabled={loading || !regulamentoAccepted}>
                            {loading ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Spinner />
                                    Cadastrando...
                                </div>
                            ) : (
                                <>
                                    <FiUserPlus />
                                    Cadastrar
                                </>
                            )}
                        </Button>

                        <HelpText>
                            * Campos obrigatórios
                            <br />
                            <small>Você pode adicionar mais informações depois no seu perfil</small>
                        </HelpText>
                    </Form>
                )}
            </AuthCard>

            <Regulamento
                isOpen={showRegulamento}
                onClose={() => setShowRegulamento(false)}
                onAccept={() => {
                    setRegulamentoAccepted(true);
                    toast.success('Regulamento aceito com sucesso!');
                }}
            />
        </Container>
    );
}

export default AuthNovoClean;
