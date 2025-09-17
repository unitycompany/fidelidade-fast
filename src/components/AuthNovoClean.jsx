import React, { useRef, useState } from 'react';
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

    // Estados para registro (campos e etapas)
    const [registerData, setRegisterData] = useState({
        nome: '',
        cpf: '',
        cnpj: '', // opcional
        telefone: '',
        email: ''
    });

    // Refs para auto-avançar entre inputs do cadastro
    const nomeRef = useRef(null);
    const cpfRef = useRef(null);
    const cnpjRef = useRef(null);
    const telefoneRef = useRef(null);
    const emailRef = useRef(null);
    const cadastrarBtnRef = useRef(null);

    // Etapas e estados do OTP no cadastro
    const [registerStep, setRegisterStep] = useState('form'); // 'form' | 'otp'
    const [registerOtpDigits, setRegisterOtpDigits] = useState(['', '', '', '', '', '']);
    const [registerPhoneE164, setRegisterPhoneE164] = useState('');
    const [registerMsg, setRegisterMsg] = useState('');
    const [registerOtpMsg, setRegisterOtpMsg] = useState('');
    const [registerSendingCode, setRegisterSendingCode] = useState(false);
    const [registerVerifying, setRegisterVerifying] = useState(false);
    const [registerResendLeft, setRegisterResendLeft] = useState(0);
    const [registerCooldownId, setRegisterCooldownId] = useState(null);

    // Estados para regulamento
    const [regulamentoAccepted, setRegulamentoAccepted] = useState(false);
    const [showRegulamento, setShowRegulamento] = useState(false);

    // Funções de formatação
    const formatCPF = (value) => {
        const numbers = value.replace(/\D/g, '').slice(0, 11);
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };
    const formatCNPJ = (value) => {
        const numbers = value.replace(/\D/g, '').slice(0, 14);
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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

    const startRegisterCooldown = (seconds = 60) => {
        if (registerCooldownId) {
            clearInterval(registerCooldownId);
        }
        setRegisterResendLeft(seconds);
        const id = setInterval(() => {
            setRegisterResendLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        setRegisterCooldownId(id);
    };

    // Validações
    // ===== Validações CPF/CNPJ com dígitos verificadores =====
    const validateCPF = (cpf) => {
        const s = (cpf || '').replace(/\D/g, '');
        if (s.length !== 11) return false;
        if (/^(\d)\1{10}$/.test(s)) return false;
        let sum = 0;
        for (let i = 0; i < 9; i++) sum += parseInt(s.charAt(i)) * (10 - i);
        let rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        if (rev !== parseInt(s.charAt(9))) return false;
        sum = 0;
        for (let i = 0; i < 10; i++) sum += parseInt(s.charAt(i)) * (11 - i);
        rev = 11 - (sum % 11);
        if (rev === 10 || rev === 11) rev = 0;
        return rev === parseInt(s.charAt(10));
    };

    const validateCNPJ = (cnpj) => {
        const s = (cnpj || '').replace(/\D/g, '');
        if (s.length !== 14) return false;
        if (/^(\d)\1{13}$/.test(s)) return false;
        const calc = (base) => {
            let len = base.length - 7, sum = 0, pos = len - 7;
            for (let i = len; i >= 1; i--) {
                sum += parseInt(base.charAt(len - i)) * pos--;
                if (pos < 2) pos = 9;
            }
            let res = sum % 11;
            return (res < 2) ? 0 : 11 - res;
        };
        const base12 = s.substring(0, 12);
        const d1 = calc(base12);
        const d2 = calc(base12 + d1);
        return s.endsWith(`${d1}${d2}`);
    };

    // (removido: validação combinada por tipo; validamos CPF e CNPJ separadamente)

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

    const verifyLoginOtp = async () => {
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
                    if (user.status === 'bloqueado') {
                        const msg = 'Seu acesso foi bloqueado por tentativa de fraude. Caso ache que isso é um erro, dirija-se até uma loja e solicite ajuda!';
                        setMsgCode(msg);
                        toast.error(msg);
                        return;
                    }
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

    const handleLoginVerifyCode = async (e) => {
        e.preventDefault();
        await verifyLoginOtp();
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

    // ===== Unicidade e bloqueio =====
    const checkCpfInBlocklist = async (cpfCnpjDigits) => {
        const only = (cpfCnpjDigits || '').replace(/\D/g, '');
        if (only.length !== 11) return false; // apenas CPF é bloqueável aqui
        try {
            const { data, error } = await supabase
                .from('cpf_nao_valido')
                .select('cpf')
                .eq('cpf', only)
                .limit(1);
            if (error) return false;
            return Array.isArray(data) && data.length > 0;
        } catch (_) {
            // fallback silencioso se a tabela não existir
            return false;
        }
    };

    const uniqueCpf = async (cpf) => {
        const digits = cpf.replace(/\D/g, '');
        const formatted = formatCPF(digits);
        try {
            const { data } = await supabase
                .from('clientes_fast')
                .select('id')
                .or(`cpf_cnpj.eq.${formatted},cpf_cnpj.eq.${digits}`)
                .limit(1);
            return !(data && data.length);
        } catch (_) {
            return true;
        }
    };

    const uniqueCnpj = async (cnpj) => {
        // verifica se já usaram este CNPJ como principal (cpf_cnpj) ou como opcional
        const digits = cnpj.replace(/\D/g, '');
        const formatted = formatCNPJ(digits);
        try {
            const { data } = await supabase
                .from('clientes_fast')
                .select('id')
                .or(`cpf_cnpj.eq.${formatted},cpf_cnpj.eq.${digits},cnpj_opcional.eq.${formatted},cnpj_opcional.eq.${digits}`)
                .limit(1);
            return !(data && data.length);
        } catch (_) {
            return true;
        }
    };

    const uniqueEmail = async (email) => {
        if (!email) return true;
        const { data, error } = await supabase
            .from('clientes_fast')
            .select('id')
            .eq('email', email)
            .limit(1);
        if (error) return true;
        return !(Array.isArray(data) && data.length > 0);
    };

    const uniqueTelefone = async (telMaskedOrE164) => {
        const e164 = toE164('+55 ' + telMaskedOrE164.replace(/\D/g, '')) || telMaskedOrE164;
        const digits = digitsOnly(e164).slice(-8);
        try {
            const { data } = await supabase
                .from('clientes_fast')
                .select('id, telefone')
                .or(`telefone.eq.${e164},telefone.ilike.*${digits}*,telefone.eq.${telMaskedOrE164}`)
                .limit(1);
            return !(data && data.length);
        } catch (_) {
            return true;
        }
    };

    const handleRegisterStart = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setRegisterMsg('');

        try {
            const newErrors = {};
            const nome = registerData.nome.trim();
            if (!nome || nome.length < 3 || /\d/.test(nome)) {
                newErrors.nome = 'Informe seu nome completo (sem números).';
            }

            // CPF obrigatório
            if (!registerData.cpf) {
                newErrors.cpf = 'CPF é obrigatório';
            } else {
                const cpfDigits = registerData.cpf.replace(/\D/g, '');
                if (!(cpfDigits.length === 11 && validateCPF(cpfDigits))) {
                    newErrors.cpf = 'CPF inválido';
                } else {
                    const blocked = await checkCpfInBlocklist(registerData.cpf);
                    if (blocked) newErrors.cpf = 'Este CPF não pode criar conta no sistema.';
                    const cpfUnique = await uniqueCpf(registerData.cpf);
                    if (!cpfUnique) newErrors.cpf = 'CPF já cadastrado';
                }
            }

            // CNPJ opcional
            if (registerData.cnpj) {
                const cnpjDigits = registerData.cnpj.replace(/\D/g, '');
                if (!(cnpjDigits.length === 14 && validateCNPJ(cnpjDigits))) {
                    newErrors.cnpj = 'CNPJ inválido';
                } else {
                    const cnpjUnique = await uniqueCnpj(registerData.cnpj);
                    if (!cnpjUnique) newErrors.cnpj = 'CNPJ já cadastrado';
                }
            }

            if (!registerData.telefone.trim()) {
                newErrors.telefone = 'Telefone é obrigatório';
            } else {
                const telOk = toE164('+55 ' + registerData.telefone.replace(/\D/g, ''));
                if (!telOk) newErrors.telefone = 'Telefone inválido';
                else {
                    const uniqTel = await uniqueTelefone(registerData.telefone);
                    if (!uniqTel) newErrors.telefone = 'WhatsApp já cadastrado';
                }
            }

            if (!registerData.email) {
                newErrors.email = 'Email é obrigatório';
            } else if (!validateEmail(registerData.email)) {
                newErrors.email = 'Email inválido';
            } else {
                const uniqEmail = await uniqueEmail(registerData.email);
                if (!uniqEmail) newErrors.email = 'Email já cadastrado';
            }

            if (!regulamentoAccepted) {
                newErrors.regulamento = 'É necessário aceitar o regulamento para prosseguir';
            }

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            // Enviar OTP para o WhatsApp informado
            const e164 = toE164('+55 ' + registerData.telefone.replace(/\D/g, ''));
            setRegisterPhoneE164(e164);
            setRegisterSendingCode(true);
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
            } catch (_) { }
            if (ok) {
                setRegisterOtpDigits(['', '', '', '', '', '']);
                setRegisterStep('otp');
                startRegisterCooldown(60);
                setRegisterOtpMsg('Código enviado por WhatsApp.');
                toast.success('Código enviado por WhatsApp.');
            } else {
                setRegisterMsg('Não foi possível enviar o código. Tente novamente.');
                toast.error('Falha ao enviar o código.');
            }
        } catch (error) {
            console.error('❌ Erro no início do cadastro:', error);
            toast.error('Erro ao iniciar cadastro');
        } finally {
            setLoading(false);
            setRegisterSendingCode(false);
        }
    };

    const handleRegisterVerify = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setRegisterOtpMsg('');
        const code = registerOtpDigits.join('').replace(/\D/g, '');
        if (code.length !== 6) {
            setRegisterOtpMsg('Digite os 6 dígitos do código.');
            return;
        }
        try {
            setRegisterVerifying(true);
            const res = await fetch(`${N8N_BASE}/webhook/check-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: registerPhoneE164, code })
            });
            let approved = false;
            let status = 'unknown';
            try {
                const ct = res.headers.get('content-type') || '';
                if (ct.includes('application/json')) {
                    const j = await res.json();
                    approved = !!j.approved;
                    status = j.status || status;
                } else {
                    approved = res.ok;
                }
            } catch (_) { }

            if (!approved) {
                let msg = 'Código inválido. Tente novamente.';
                if (status === 'expired') msg = 'Código expirado. Clique em Reenviar.';
                if (status === 'blocked') msg = 'Muitas tentativas. Aguarde e solicite um novo código.';
                setRegisterOtpMsg(msg);
                toast.error(msg);
                return;
            }

            // Criar usuário somente após OTP válido
                const { data, error } = await supabase
                    .from('clientes_fast')
                    .insert([{
                        nome: registerData.nome.trim(),
                        cpf_cnpj: (registerData.cpf || '').replace(/\D/g, ''),
                        tipo: 'CPF',
                        cnpj_opcional: registerData.cnpj ? registerData.cnpj.replace(/\D/g, '') : null,
                        telefone: registerData.telefone,
                        email: registerData.email || null,
                        saldo_pontos: 0,
                        total_pontos_ganhos: 0,
                        total_pontos_gastos: 0,
                        role: 'cliente'
                    }])
                    .select()
                    .single();
            if (error) throw error;

            toast.success('Cadastro realizado com sucesso!');
            onLogin(data);
        } catch (err) {
            console.error('Erro ao verificar OTP/cadastrar:', err);
            toast.error('Falha ao concluir cadastro');
        } finally {
            setRegisterVerifying(false);
        }
    };

    const handleRegisterResend = async () => {
        if (!registerPhoneE164 || registerResendLeft > 0) return;
        try {
            setRegisterSendingCode(true);
            const res = await fetch(`${N8N_BASE}/webhook/start-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: registerPhoneE164, resend: true })
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
                startRegisterCooldown(60);
                setRegisterOtpMsg('Novo código enviado.');
                toast.success('Novo código enviado.');
            } else {
                setRegisterOtpMsg('Não foi possível reenviar agora. Tente novamente.');
                toast.error('Falha ao reenviar.');
            }
        } catch (err) {
            console.error('Erro ao reenviar OTP cadastro:', err);
            setRegisterOtpMsg('Falha ao reenviar. Tente novamente.');
            toast.error('Falha ao reenviar.');
        } finally {
            setRegisterSendingCode(false);
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
                                            onChange={async (e) => {
                                                const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                                                const arr = [...otpDigits];
                                                arr[i] = v;
                                                setOtpDigits(arr);
                                                // foco automático próximo
                                                if (v && i < 5) {
                                                    const next = e.target.parentElement.querySelectorAll('input')[i + 1];
                                                    next && next.focus();
                                                }
                                                const joined = arr.join('');
                                                if (joined.length === 6) {
                                                    await verifyLoginOtp();
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
                    <Form onSubmit={registerStep === 'form' ? handleRegisterStart : handleRegisterVerify}>
                        {registerStep === 'form' ? (
                        <>
                        <FormGroup>
                            <Label>Nome Completo *</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiUser />
                                </InputIcon>
                                <Input
                                    type="text"
                                    value={registerData.nome}
                                    ref={nomeRef}
                                    onChange={(e) => setRegisterData(prev => ({ ...prev, nome: e.target.value }))}
                                    placeholder="Digite seu nome completo"
                                    required
                                />
                            </InputWrapper>
                            {errors.nome && <ErrorMessage>{errors.nome}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label>CPF *</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiUser />
                                </InputIcon>
                                <Input
                                    type="text"
                                    value={registerData.cpf}
                                    ref={cpfRef}
                                    onChange={async (e) => {
                                        const v = formatCPF(e.target.value);
                                        setRegisterData(prev => ({ ...prev, cpf: v }));
                                        setErrors(prev => ({ ...prev, cpf: undefined }));
                                        const n = v.replace(/\D/g, '');
                                        if (n.length === 11) {
                                            if (!validateCPF(n)) {
                                                setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
                                                return;
                                            }
                                            const blocked = await checkCpfInBlocklist(v);
                                            if (blocked) {
                                                setErrors(prev => ({ ...prev, cpf: 'Este CPF não pode criar conta no sistema.' }));
                                                return;
                                            }
                                            const okUnique = await uniqueCpf(v);
                                            if (!okUnique) {
                                                setErrors(prev => ({ ...prev, cpf: 'CPF já cadastrado' }));
                                                return;
                                            }
                                            // válido -> focar CNPJ (opcional)
                                            cnpjRef.current?.focus();
                                        }
                                    }}
                                    placeholder={'000.000.000-00'}
                                    required
                                />
                            </InputWrapper>
                            {errors.cpf && <ErrorMessage>{errors.cpf}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label>CNPJ (opcional)</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiUser />
                                </InputIcon>
                                <Input
                                    type="text"
                                    value={registerData.cnpj}
                                    ref={cnpjRef}
                                    onChange={async (e) => {
                                        const v = formatCNPJ(e.target.value);
                                        setRegisterData(prev => ({ ...prev, cnpj: v }));
                                        setErrors(prev => ({ ...prev, cnpj: undefined }));
                                        const n = v.replace(/\D/g, '');
                                        if (n.length === 14) {
                                            if (!validateCNPJ(n)) {
                                                setErrors(prev => ({ ...prev, cnpj: 'CNPJ inválido' }));
                                                return;
                                            }
                                            const okUnique = await uniqueCnpj(v);
                                            if (!okUnique) {
                                                setErrors(prev => ({ ...prev, cnpj: 'CNPJ já cadastrado' }));
                                                return;
                                            }
                                            // válido -> focar telefone
                                            telefoneRef.current?.focus();
                                        }
                                        if (n.length === 0) {
                                            // vazio -> seguir para telefone
                                            telefoneRef.current?.focus();
                                        }
                                    }}
                                    placeholder={'00.000.000/0000-00'}
                                />
                            </InputWrapper>
                            <HelpText style={{ textAlign: 'left', marginTop: 6 }}>
                                Informe o CNPJ. Se já comprou com CNPJ, preencha para conseguir receber os pontos.
                            </HelpText>
                            {errors.cnpj && <ErrorMessage>{errors.cnpj}</ErrorMessage>}
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
                                    ref={telefoneRef}
                                    onChange={async (e) => {
                                        const v = formatPhone(e.target.value);
                                        setRegisterData(prev => ({ ...prev, telefone: v }));
                                        setErrors(prev => ({ ...prev, telefone: undefined }));
                                        const d = v.replace(/\D/g, '');
                                        if (d.length >= 10) {
                                            const e164 = toE164('+55 ' + d);
                                            if (!e164) {
                                                setErrors(prev => ({ ...prev, telefone: 'Telefone inválido' }));
                                                return;
                                            }
                                            const uniq = await uniqueTelefone(v);
                                            if (!uniq) {
                                                setErrors(prev => ({ ...prev, telefone: 'WhatsApp já cadastrado' }));
                                                return;
                                            }
                                            emailRef.current?.focus();
                                        }
                                    }}
                                    placeholder="(00) 00000-0000"
                                    required
                                />
                            </InputWrapper>
                            {errors.telefone && <ErrorMessage>{errors.telefone}</ErrorMessage>}
                        </FormGroup>

                        <FormGroup>
                            <Label>Email *</Label>
                            <InputWrapper>
                                <InputIcon>
                                    <FiMail />
                                </InputIcon>
                                <Input
                                    type="email"
                                    value={registerData.email}
                                    ref={emailRef}
                                    onChange={async (e) => {
                                        const v = e.target.value;
                                        setRegisterData(prev => ({ ...prev, email: v }));
                                        setErrors(prev => ({ ...prev, email: undefined }));
                                        if (v && validateEmail(v)) {
                                            const uniq = await uniqueEmail(v);
                                            if (!uniq) {
                                                setErrors(prev => ({ ...prev, email: 'Email já cadastrado' }));
                                                return;
                                            }
                                            cadastrarBtnRef.current?.focus();
                                        }
                                    }}
                                    placeholder="Digite seu email"
                                    required
                                />
                            </InputWrapper>
                            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
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

                        {registerMsg && <AlertErr>{registerMsg}</AlertErr>}

                        <Button type="submit" ref={cadastrarBtnRef} disabled={loading || !regulamentoAccepted}>
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
                             <small>Mantenha seus dados sempre atualizados para garantir o recebimento correto dos pontos.</small>
                        </HelpText>
                        </>
                        ) : (
                        <>
                            <HelpText>
                                Enviamos um código para <b>{registerPhoneE164}</b>.
                                <br />
                                <button
                                    type="button"
                                    onClick={() => { setRegisterStep('form'); setRegisterOtpDigits(['','','','','','']); setRegisterMsg(''); setRegisterOtpMsg(''); }}
                                    style={{ background: 'none', border: 'none', color: '#A91918', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    <FiArrowLeft style={{ verticalAlign: 'middle' }} /> alterar número
                                </button>
                            </HelpText>

                            <OtpContainer>
                                {registerOtpDigits.map((d, i) => (
                                    <OtpInput
                                        key={i}
                                        maxLength={1}
                                        inputMode="numeric"
                                        value={d}
                                        onChange={async (e) => {
                                            const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                                            const arr = [...registerOtpDigits];
                                            arr[i] = v;
                                            setRegisterOtpDigits(arr);
                                            if (v && i < 5) {
                                                const next = e.target.parentElement.querySelectorAll('input')[i + 1];
                                                next && next.focus();
                                            }
                                            const joined = arr.join('');
                                            if (joined.length === 6) {
                                                await handleRegisterVerify();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !registerOtpDigits[i] && i > 0) {
                                                const prev = e.currentTarget.parentElement.querySelectorAll('input')[i - 1];
                                                prev && prev.focus();
                                            }
                                        }}
                                    />
                                ))}
                            </OtpContainer>

                            <Inline>
                                <Button type="submit" disabled={registerVerifying} style={{ flex: 1, minWidth: 180 }} onClick={handleRegisterVerify}>
                                    {registerVerifying ? (<><Spinner /> Validando...</>) : (<><FiCheck /> Validar código</>)}
                                </Button>
                                <SecondaryButton type="button" onClick={handleRegisterResend} disabled={registerSendingCode || registerResendLeft > 0} style={{ flex: 1, minWidth: 180 }}>
                                    <FiRefreshCw /> Reenviar {registerResendLeft > 0 ? `(${registerResendLeft}s)` : ''}
                                </SecondaryButton>
                            </Inline>

                            {registerOtpMsg && (
                                registerOtpMsg.toLowerCase().includes('código enviado') || registerOtpMsg.toLowerCase().includes('novo código')
                                    ? <AlertOk>{registerOtpMsg}</AlertOk>
                                    : <AlertErr>{registerOtpMsg}</AlertErr>
                            )}
                        </>
                        )}
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
