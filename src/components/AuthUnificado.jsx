import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiUser, FiLock, FiMail, FiLogIn, FiLoader, FiShield, FiUsers, FiUserCheck } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import toast from 'react-hot-toast';

// Animações
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Container principal
const AuthContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: 'Montserrat', sans-serif;
`;

const AuthCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
  width: 100%;
  max-width: 450px;
  animation: ${fadeInUp} 0.6s ease-out;
  
  @media (max-width: 600px) {
    padding: 2rem;
    margin: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Logo = styled.div`
  background: linear-gradient(135deg, #cc1515 0%, #9b0c0c 100%);
  color: white;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  animation: ${pulse} 2s infinite;
  
  svg {
    font-size: 2rem;
  }
`;

const Title = styled.h1`
  color: #2D3748;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: #718096;
  font-size: 1rem;
`;

// Tabs para tipo de usuário
const UserTypeTabs = styled.div`
  display: flex;
  background: #f7f7f7;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 2rem;
`;

const UserTypeTab = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? '#2D3748' : '#718096'};
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    color: #2D3748;
  }
  
  svg {
    font-size: 1rem;
  }
`;

// Formulário
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #4A5568;
  font-weight: 600;
  font-size: 0.9rem;
`;

const InputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 2px solid ${props => props.$error ? '#e53e3e' : '#e2e8f0'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #cc1515;
    box-shadow: 0 0 0 3px rgba(204, 21, 21, 0.1);
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  color: #a0aec0;
  z-index: 1;
`;

const ErrorMessage = styled.span`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #cc1515 0%, #9b0c0c 100%);
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(204, 21, 21, 0.3);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const UserTypeIndicator = styled.div`
  background: ${props => {
        switch (props.$userType) {
            case 'admin_supremo': return 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)';
            case 'gerente': return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
            default: return 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
        }
    }};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

function AuthUnificado({ onLogin }) {
    const [userType, setUserType] = useState('cliente');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });
    const [errors, setErrors] = useState({});

    const userTypeOptions = [
        { key: 'cliente', label: 'Cliente', icon: FiUser },
        { key: 'gerente', label: 'Gerente', icon: FiUsers },
        { key: 'admin_supremo', label: 'Admin', icon: FiShield }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }

        if (!formData.senha.trim()) {
            newErrors.senha = 'Senha é obrigatória';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            console.log('🔐 Tentando login como:', userType, formData.email);

            let userData = null;
            let source = '';

            // Para clientes, buscar na tabela clientes_fast
            if (userType === 'cliente') {
                const { data, error } = await supabase
                    .from('clientes_fast')
                    .select('*')
                    .eq('email', formData.email)
                    .eq('status', 'ativo')
                    .single();

                if (data && data.senha === formData.senha) {
                    userData = { ...data, role: data.role || 'cliente' };
                    source = 'clientes_fast';
                }
            }
            // Para admin/gerente, buscar na tabela usuarios_sistema
            else {
                const { data, error } = await supabase
                    .from('usuarios_sistema')
                    .select(`
            *,
            lojas (
              id,
              nome,
              cidade,
              estado
            )
          `)
                    .eq('email', formData.email)
                    .eq('role', userType)
                    .eq('ativo', true)
                    .single();

                if (data && data.senha === formData.senha) {
                    userData = {
                        ...data,
                        saldo_pontos: 0,
                        total_pontos_ganhos: 0,
                        total_pontos_gastos: 0,
                        loja: data.lojas
                    };
                    source = 'usuarios_sistema';
                }
            }

            if (!userData) {
                toast.error('Credenciais inválidas ou usuário não encontrado');
                setErrors({
                    email: 'Email ou senha incorretos',
                    senha: 'Email ou senha incorretos'
                });
                return;
            }

            // Atualizar último login
            if (source === 'usuarios_sistema') {
                await supabase
                    .from('usuarios_sistema')
                    .update({ ultimo_login: new Date().toISOString() })
                    .eq('id', userData.id);
            } else {
                await supabase
                    .from('clientes_fast')
                    .update({ ultima_atividade: new Date().toISOString() })
                    .eq('id', userData.id);
            }

            const roleNames = {
                admin_supremo: 'Administrador Supremo',
                gerente: 'Gerente',
                cliente: 'Cliente'
            };

            toast.success(`Bem-vindo, ${userData.nome}! (${roleNames[userData.role]})`);
            onLogin(userData);

        } catch (error) {
            console.error('❌ Erro no login:', error);
            toast.error('Erro interno. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const getUserTypeLabel = () => {
        const labels = {
            cliente: 'Cliente do Sistema',
            gerente: 'Gerente de Loja',
            admin_supremo: 'Administrador Supremo'
        };
        return labels[userType];
    };

    return (
        <AuthContainer>
            <AuthCard>
                <Header>
                    <Logo>
                        <FiShield />
                    </Logo>
                    <Title>Fast Sistemas</Title>
                    <Subtitle>Sistema de Fidelidade</Subtitle>
                </Header>

                <UserTypeTabs>
                    {userTypeOptions.map(({ key, label, icon: Icon }) => (
                        <UserTypeTab
                            key={key}
                            $active={userType === key}
                            onClick={() => setUserType(key)}
                            type="button"
                        >
                            <Icon />
                            {label}
                        </UserTypeTab>
                    ))}
                </UserTypeTabs>

                <UserTypeIndicator $userType={userType}>
                    <FiUserCheck />
                    Fazendo login como: {getUserTypeLabel()}
                </UserTypeIndicator>

                <Form onSubmit={handleLogin}>
                    <InputGroup>
                        <Label>Email</Label>
                        <InputContainer>
                            <InputIcon>
                                <FiMail />
                            </InputIcon>
                            <Input
                                type="email"
                                placeholder="Digite seu email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                $error={errors.email}
                                disabled={loading}
                            />
                        </InputContainer>
                        {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
                    </InputGroup>

                    <InputGroup>
                        <Label>Senha</Label>
                        <InputContainer>
                            <InputIcon>
                                <FiLock />
                            </InputIcon>
                            <Input
                                type="password"
                                placeholder="Digite sua senha"
                                value={formData.senha}
                                onChange={(e) => handleInputChange('senha', e.target.value)}
                                $error={errors.senha}
                                disabled={loading}
                            />
                        </InputContainer>
                        {errors.senha && <ErrorMessage>{errors.senha}</ErrorMessage>}
                    </InputGroup>

                    <LoginButton type="submit" disabled={loading}>
                        {loading ? (
                            <>
                                <FiLoader className="animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            <>
                                <FiLogIn />
                                Entrar
                            </>
                        )}
                    </LoginButton>
                </Form>
            </AuthCard>
        </AuthContainer>
    );
}

export default AuthUnificado;
