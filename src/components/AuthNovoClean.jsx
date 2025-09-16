import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import toast from 'react-hot-toast';
import { FiUser, FiLock, FiMail, FiPhone, FiLogIn, FiUserPlus, FiLoader, FiFileText, FiCheck, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { supabase } from '../services/supabase';
import LoadingGif from './LoadingGif';
import Regulamento from './Regulamento';

// Detect dev vs prod to decide webhook base (Vite injects import.meta.env.DEV)
const N8N_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV)
    ? '' // dev: use Vite proxy with relative path
    : 'https://n8n.unitycompany.com.br';

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

const SecondaryButton = styled(Button)`
    background: #fff;
    color: #A91918;
    border: 1px solid #A91918;
    &:hover:not(:disabled) {
        animation: none;
        background: #fff3f3;
    }
`;

const Inline = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
`;

const Alert = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border-radius: 7px;
    padding: 12px 16px;
    margin: 10px 0 0 0;
    font-size: 0.95rem;
    min-height: 38px;
    text-align: center;
    background: #f8f9fa;
    border: 1px solid #e9ecef;
`;

const AlertOk = styled(Alert)`
    color: #0a7f4b;
    background: #eafaf1;
    border-color: #b6e7d2;
`;

const AlertErr = styled(Alert)`
    color: #b00020;
    background: #fff0f0;
    border-color: #f5bfc0;
`;

const OtpContainer = styled.div`
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-top: 22px;
`;

const OtpInput = styled.input`
    width: 46px;
    height: 46px;
    text-align: center;
    font-size: 1.15rem;
    letter-spacing: 2px;
    padding: 0;
    background: #f9f9f9;
    border: 1px solid #e9ecef;
    transition: all 0.2s ease;
    font-family: inherit;
    &:focus {
        outline: none;
        border-color: #A91918;
        box-shadow: 0 0 0 1px rgba(169, 25, 24, 0.1);
        background: #fff;
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

    // ===== Login por WhatsApp (OTP) =====
    const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'code'
    const [phoneInput, setPhoneInput] = useState('+55 ');
    const [currentPhoneE164, setCurrentPhoneE164] = useState('');
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [sendingCode, setSendingCode] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [resendLeft, setResendLeft] = useState(0);
    const [msgPhone, setMsgPhone] = useState('');
    const [msgCode, setMsgCode] = useState('');
    const [cooldownId, setCooldownId] = useState(null);

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

    // Helpers para máscara BR/E.164
    const digitsOnly = (s) => (s.match(/\d+/g) || []).join('');
    const formatBRMask = (v) => {
        let d = digitsOnly(v);
        if (!d.startsWith('55')) d = '55' + d;
        d = d.slice(0, 13); // 55 + 11 dígitos
        const local = d.slice(2), ddd = local.slice(0, 2), rest = local.slice(2);
        let out = '+55';
        if (ddd) out += ` (${ddd})`;
        if (rest) {
            if (rest.length <= 5) out += ` ${rest}`;
            else out += ` ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
        }
        return out;
    };
    const toE164 = (masked) => {
        const d = digitsOnly(masked);
        if (!d.startsWith('55')) return null;
        const local = d.slice(2);
        if (local.length < 10 || local.length > 11) return null;
        return '+' + d;
    };
    const isE164 = (p) => /^\+\d{8,15}$/.test(p);
    const maskFromDigitsBR = (digits) => {
        // digits = 10 ou 11 (DDD + número)
        if (digits.length < 10) return null;
        const ddd = digits.slice(0, 2);
        const rest = digits.slice(2);
        if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
        if (rest.length === 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
        // fallback 11
        return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
    };

    // Cooldown para reenvio
    const startCooldown = (seconds = 60) => {
        if (cooldownId) {
            clearInterval(cooldownId);
        }
        setResendLeft(seconds);
        const id = setInterval(() => {
            setResendLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setCooldownId(id);
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
    const handleLoginSendCode = async (e) => {
        e.preventDefault();
        setMsgPhone('');
        const masked = formatBRMask(phoneInput);
        setPhoneInput(masked);
        const e164 = toE164(masked);
        if (!e164 || !isE164(e164)) {
            setMsgPhone('Telefone inválido. Use +55 (DDD) 9XXXX-XXXX.');
            return;
        }
        try {
            setSendingCode(true);
            // Disparar webhook de início
            const res = await fetch(`${N8N_BASE}/webhook/start-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: e164 })
            });
            let ok = res.ok;
            try {
                const ct = res.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const j = await res.json();
                    ok = j.ok !== false;
                } else {
                    await res.text();
                }
            } catch (_) { /* ignore parse errors */ }
            if (ok) {
                setCurrentPhoneE164(e164);
                setOtpDigits(['', '', '', '', '', '']);
                setOtpStep('code');
                startCooldown(60);
                setMsgCode('Código enviado por WhatsApp.');
                toast.success('Código enviado por WhatsApp.');
            } else {
                setMsgPhone('Não foi possível enviar o código. Tente novamente.');
                toast.error('Falha ao enviar o código.');
            }
        } catch (err) {
            console.error('Erro ao enviar OTP:', err);
            setMsgPhone('Falha na requisição. Tente novamente.');
            toast.error('Falha na requisição.');
        } finally {
            setSendingCode(false);
        }
    };

    const findUserByPhone = async (e164) => {
        const d = digitsOnly(e164).slice(2); // remove 55
        const masked = maskFromDigitsBR(d);
        // 1) tentativa por máscara padrão
        let { data: userData, error } = await supabase
            .from('clientes_fast')
            .select('*')
            .eq('telefone', masked)
            .single();
        if (!error && userData) return userData;
        // 2) tentativa por E.164
        ({ data: userData, error } = await supabase
            .from('clientes_fast')
            .select('*')
            .eq('telefone', e164)
            .single());
        if (!error && userData) return userData;
        // 3) fallback: buscar por sufixo de 8 dígitos
        const suffix = d.slice(-8);
        const { data: list } = await supabase
            .from('clientes_fast')
            .select('*')
            .ilike('telefone', `%${suffix}%`)
            .limit(1);
        if (list && list.length) return list[0];
        return null;
    };

    const handleLoginVerifyCode = async (e) => {
        e.preventDefault();
        setMsgCode('');
        const code = otpDigits.join('').replace(/\D/g, '');
        if (code.length !== 6) {
            setMsgCode('Digite os 6 dígitos do código.');
            return;
        }
        try {
            setVerifying(true);
            const res = await fetch(`${N8N_BASE}/webhook/check-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentPhoneE164, code })
            });
            let approved = false;
            let status = 'unknown';
            let serverText = '';
            try {
                const ct = res.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const j = await res.json();
                    approved = !!j.approved;
                    status = j.status || status;
                } else {
                    const t = await res.text();
                    serverText = t;
                    approved = res.ok;
                    status = res.ok ? 'ok' : (t || 'erro');
                }
            } catch (_) { /* ignore */ }

            if (approved) {
                // Buscar usuário pela conta vinculada ao telefone
                const user = await findUserByPhone(currentPhoneE164);
                if (user) {
                    toast.success(`Bem-vindo, ${user.nome}!`);
                    onLogin(user);
                } else {
                    setMsgCode('Código válido, mas não encontramos uma conta com este WhatsApp.');
                    toast.error('Conta não encontrada para este WhatsApp.');
                }
            } else {
                let msg = 'Código inválido. Tente novamente.';
                if (status === 'expired') msg = 'Código expirado. Clique em Reenviar.';
                if (status === 'blocked') msg = 'Muitas tentativas. Aguarde e solicite um novo código.';
                if (!res.ok && serverText) {
                    msg += ` (detalhe do servidor: ${serverText.slice(0, 180)})`;
                }
                setMsgCode(msg);
                toast.error(msg);
            }
        } catch (err) {
            console.error('Erro na verificação OTP:', err);
            setMsgCode('Falha na verificação. Tente novamente.');
            toast.error('Falha na verificação.');
        } finally {
            setVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!currentPhoneE164 || resendLeft > 0) return;
        setMsgCode('');
        try {
            setSendingCode(true);
            const res = await fetch(`${N8N_BASE}/webhook/start-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: currentPhoneE164, resend: true })
            });
            let ok = res.ok;
            try {
                const ct = res.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const j = await res.json();
                    ok = j.ok !== false;
                } else {
                    await res.text();
                }
            } catch (_) { }
            if (ok) {
                startCooldown(60);
                setMsgCode('Novo código enviado.');
                toast.success('Novo código enviado.');
            } else {
                setMsgCode('Não foi possível reenviar agora. Tente novamente.');
                toast.error('Falha ao reenviar.');
            }
        } catch (err) {
            console.error('Erro ao reenviar OTP:', err);
            setMsgCode('Falha ao reenviar. Tente novamente.');
            toast.error('Falha ao reenviar.');
        } finally {
            setSendingCode(false);
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
                    <Form onSubmit={otpStep === 'phone' ? handleLoginSendCode : handleLoginVerifyCode}>
                        {otpStep === 'phone' ? (
                            <>
                                <FormGroup>
                                    <Label>Seu WhatsApp</Label>
                                    <InputWrapper>
                                        <InputIcon>
                                            <FiPhone />
                                        </InputIcon>
                                        <Input
                                            type="tel"
                                            value={phoneInput}
                                            onChange={(e) => setPhoneInput(formatBRMask(e.target.value))}
                                            placeholder="+55 (DDD) 9XXXX-XXXX"
                                        />
                                    </InputWrapper>
                                    {msgPhone && <AlertErr>{msgPhone}</AlertErr>}
                                </FormGroup>

                                <Button type="submit" disabled={sendingCode}>
                                    {sendingCode ? (
                                        <><Spinner /> Enviando...</>
                                    ) : (
                                        <><FiLogIn /> Enviar código por WhatsApp</>
                                    )}
                                </Button>

                                <HelpText>
                                    Usaremos o número cadastrado na sua conta.
                                </HelpText>
                            </>
                        ) : (
                            <>
                                <HelpText>
                                    Enviamos um código para <b>{currentPhoneE164}</b>. <br />
                                    <button
                                        type="button"
                                        onClick={() => { setOtpStep('phone'); setMsgPhone(''); setMsgCode(''); }}
                                        style={{ background: 'none', border: 'none', color: '#A91918', textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        <FiArrowLeft style={{ verticalAlign: 'middle' }} /> alterar número
                                    </button>
                                </HelpText>

                                <OtpContainer>
                                    {otpDigits.map((d, i) => (
                                        <OtpInput
                                            key={i}
                                            maxLength={1}
                                            inputMode="numeric"
                                            value={d}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                                                const arr = [...otpDigits];
                                                arr[i] = v;
                                                setOtpDigits(arr);
                                                // foco automático próximo
                                                if (v && i < 5) {
                                                    const next = e.target.parentElement.querySelectorAll('input')[i + 1];
                                                    next && next.focus();
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                                                    const prev = e.currentTarget.parentElement.querySelectorAll('input')[i - 1];
                                                    prev && prev.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </OtpContainer>

                                <Inline>
                                    <Button type="submit" disabled={verifying} style={{ flex: 1, minWidth: 180 }}>
                                        {verifying ? (<><Spinner /> Validando...</>) : (<><FiCheck /> Validar código</>)}
                                    </Button>
                                    <SecondaryButton type="button" onClick={handleResend} disabled={sendingCode || resendLeft > 0} style={{ flex: 1, minWidth: 180 }}>
                                        <FiRefreshCw /> Reenviar {resendLeft > 0 ? `(${resendLeft}s)` : ''}
                                    </SecondaryButton>
                                </Inline>

                                {msgCode && (
                                    msgCode.toLowerCase().includes('código enviado') || msgCode.toLowerCase().includes('novo código')
                                        ? <AlertOk>{msgCode}</AlertOk>
                                        : <AlertErr>{msgCode}</AlertErr>
                                )}
                            </>
                        )}
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
