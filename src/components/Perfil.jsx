import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiUser, FiMail, FiPhone, FiSave, FiLoader, FiEdit3, FiCheck, FiRefreshCw, FiArrowLeft, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { supabase, updateCustomerCnpj, db } from '../services/supabase';
import { digitsOnly, formatCnpj, normalizeCnpj, validateCnpj } from '../utils/cnpj';
import { getUserCnpj } from '../utils/customer';

// Detect dev vs prod to decide webhook base (same pattern as AuthNovoClean)
const N8N_BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV)
  ? ''
  : 'https://n8n.unitycompany.com.br';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled components (aligned with existing app style)
const Container = styled.div`
  height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 1rem;

  @media (max-width: 768px){
    height: auto;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 720px;
  background: white;
  border: 1px solid #e9ecef;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  animation: ${fadeIn} 0.35s ease-out;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #A91918, #d32f2f);
  color: white;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
`;

const Content = styled.div`
  padding: 1.25rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  color: #353535;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
`;

const InputWrap = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 1;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 0.9rem 0.8rem 2.4rem;
  border: 1px solid #e9ecef;
  background: white;
  color: #353535;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-sizing: border-box;
  &:focus { outline: none; border-color: #A91918; box-shadow: 0 0 0 3px rgba(169,25,24,0.1); }
  &:disabled { background: #f8f9fa; color: #6c757d; cursor: not-allowed; }
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #A91918 0%, #8B1514 100%);
  color: #fff;
  border: none;
  padding: 0.8rem 1.1rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  &:disabled { opacity: 0.7; cursor: not-allowed; }
`;

const SecondaryButton = styled(Button)`
  background: #fff;
  color: #A91918;
  border: 1px solid #A91918;
`;

const Helper = styled.div`
  color: #6c757d;
  font-size: 0.85rem;
`;

const Spinner = styled.div`
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.35); border-top-color:#fff; border-radius:50%; animation:${spin} 1s linear infinite;
`;

const Alert = styled.div`
  margin-top: 0.5rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 6px;
  color: #495057;
`;

const AlertOk = styled(Alert)`
  background: #eafaf1; border-color:#b6e7d2; color:#0a7f4b;
`;

const AlertErr = styled(Alert)`
  background: #fff0f0; border-color:#f5bfc0; color:#b00020;
`;

const OtpRow = styled.div`
  display: flex; gap: 8px; margin: 12px 0 4px 0;
`;

const OtpInput = styled.input`
  width: 42px; height: 44px; text-align: center; font-size: 1.05rem; border:1px solid #e9ecef; background:#f9f9f9;
  &:focus { outline:none; border-color:#A91918; box-shadow: 0 0 0 2px rgba(169,25,24,0.10); background:#fff; }
`;

// Helpers from AuthNovoClean for phone mask/validation
const formatBRMask = (v) => {
  let d = digitsOnly(v);
  if (!d.startsWith('55')) d = '55' + d;
  d = d.slice(0, 13);
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
  if (digits.length < 10) return null;
  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);
  if (rest.length === 9) return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  if (rest.length === 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
};

export default function Perfil({ user, onUserUpdate }) {
  const [form, setForm] = useState({ nome: '', cpf_cnpj: '', telefone: '', email: '' });
  const [cnpjOpcional, setCnpjOpcional] = useState('');
  const [editingCnpj, setEditingCnpj] = useState(false);
  const [lojaNome, setLojaNome] = useState('');
  const [savingCnpj, setSavingCnpj] = useState(false);
  const [saving, setSaving] = useState(false);
  const [otpStep, setOtpStep] = useState('form'); // 'form' | 'otp'
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [currentPhoneE164, setCurrentPhoneE164] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendLeft, setResendLeft] = useState(0);
  const [cooldownId, setCooldownId] = useState(null);
  const [msg, setMsg] = useState('');
  const [msgCode, setMsgCode] = useState('');

  useEffect(() => {
    if (!user) return;
    // Accept phone in various formats and present in BR mask +55
    let masked = user.telefone || '';
    if (masked && !masked.startsWith('+55')) {
      const d = digitsOnly(masked);
      const digits = d.startsWith('55') ? d.slice(2) : d;
      const br = maskFromDigitsBR(digits);
      masked = br ? `+55 ${br}` : '+55 ';
    }
    setForm({
      nome: user.nome || '',
      cpf_cnpj: user.cpf_cnpj || '',
      telefone: masked || '+55 ',
      email: user.email || ''
    });
    // Loja (Cidade/UF) quando gerente
    setLojaNome(user.loja_nome || '');
    // Pre-set CNPJ opcional if exists
    const existing = getUserCnpj(user);
    if (existing) setCnpjOpcional(formatCnpj(existing)); else setCnpjOpcional('');
    setEditingCnpj(false);
  }, [user]);

  useEffect(() => () => { if (cooldownId) clearInterval(cooldownId); }, [cooldownId]);

  const startCooldown = (seconds = 60) => {
    if (cooldownId) clearInterval(cooldownId);
    setResendLeft(seconds);
    const id = setInterval(() => {
      setResendLeft(prev => {
        if (prev <= 1) { clearInterval(id); return 0; }
        return prev - 1;
      });
    }, 1000);
    setCooldownId(id);
  };

  const handleSave = async () => {
    setMsg(''); setMsgCode('');
    // Se for gerente, loja é obrigatória (Cidade/UF)
    if (user?.role === 'gerente') {
      if (!validateLoja(lojaNome)) {
        toast.error('Informe o nome da loja no formato Cidade/UF, ex: Campo Grande/RJ');
        return;
      }
    }
    // If phone changed, require OTP step before saving
    const newE164 = toE164(form.telefone);
    if (!newE164 || !isE164(newE164)) {
      setMsg('Telefone inválido. Use +55 (DDD) 9XXXX-XXXX.');
      return;
    }
    const currentStoredDigits = digitsOnly(user?.telefone || '');
    const newDigits = digitsOnly(newE164);
    const changedPhone = currentStoredDigits && newDigits && currentStoredDigits !== newDigits;

    if (changedPhone) {
      // Start OTP flow to the NEW number
      try {
        setSendingCode(true);
        const res = await fetch(`${N8N_BASE}/webhook/start-otp`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: newE164 })
        });
        let ok = res.ok;
        try {
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('application/json')) { const j = await res.json(); ok = j.ok !== false; } else { await res.text(); }
        } catch { /* noop */ }
        if (!ok) throw new Error('Falha ao enviar código.');
        setCurrentPhoneE164(newE164);
        setOtpDigits(['', '', '', '', '', '']);
        setOtpStep('otp');
        startCooldown(60);
        setMsgCode('Código enviado por WhatsApp.');
        toast.success('Código enviado por WhatsApp.');
      } catch (e) {
        console.error(e);
        toast.error('Não foi possível enviar o código.');
        setMsg('Não foi possível enviar o código. Tente novamente.');
      } finally {
        setSendingCode(false);
      }
      return;
    }

    // Validar / atualizar CNPJ se preenchido e houve alteração
    const existingDigits = normalizeCnpj(user?.cnpj_opcional);
    const newCnpjDigits = normalizeCnpj(cnpjOpcional);
    if (cnpjOpcional && newCnpjDigits && newCnpjDigits !== existingDigits) {
      if (!validateCnpj(newCnpjDigits)) {
        toast.error('CNPJ inválido');
        return;
      }
      try {
        setSavingCnpj(true);
        const updated = await updateCustomerCnpj(user.id, newCnpjDigits);
        // Refetch do usuário completo para garantir sincronização (evita state inconsistente)
        let refreshed = null;
        try { refreshed = await db.buscarClientePorId(user.id); } catch { /* noop */ }
        const finalUser = refreshed || { ...user, cnpj_opcional: updated.cnpj_opcional };
        if (window.updateUserContext) window.updateUserContext({ cnpj_opcional: finalUser.cnpj_opcional });
        if (onUserUpdate) onUserUpdate(finalUser);
        setCnpjOpcional(formatCnpj(finalUser.cnpj_opcional));
        toast.success('CNPJ atualizado com sucesso');
        setEditingCnpj(false);
      } catch (e) {
        if (e?.code === 'cnpj_in_use') {
          toast.error('CNPJ já cadastrado em outra conta');
        } else if (e?.code === 'invalid_cnpj') {
          toast.error('CNPJ inválido');
        } else {
          console.error('Erro ao salvar CNPJ com alterações:', e);
          toast.error('Erro ao salvar CNPJ');
        }
        return;
      } finally {
        setSavingCnpj(false);
      }
    }

    // Sem mudança de telefone: persistir demais alterações
    await persistChanges();
  };

  const persistChanges = async () => {
    try {
      setSaving(true);
      // Store telefone as masked BR (without +55) to stay consistent with existing data
      const d = digitsOnly(form.telefone);
      const local = d.startsWith('55') ? d.slice(2) : d;
      const maskedBR = maskFromDigitsBR(local) || '';
      const updates = {
        nome: form.nome?.trim() || null,
        telefone: maskedBR || form.telefone, // fallback
        email: form.email?.trim() || null,
      };
      if (user?.role === 'gerente') {
        updates.loja_nome = (lojaNome || '').trim() || null;
      }
      const { error } = await supabase
        .from('clientes_fast')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;

      const newUser = { ...user, ...updates };
      // Prefer global updater when available
      if (typeof window !== 'undefined' && typeof window.updateUserContext === 'function') {
        window.updateUserContext(updates);
      }
      if (typeof onUserUpdate === 'function') {
        onUserUpdate(newUser);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('userUpdated'));
      }
      toast.success('Perfil atualizado com sucesso!');
    } catch (e) {
      console.error('Erro ao atualizar perfil:', e);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
      setOtpStep('form');
    }
  };

  const handleVerify = async () => {
    setMsgCode('');
    const code = otpDigits.join('').replace(/\D/g, '');
    if (code.length !== 6) { setMsgCode('Digite os 6 dígitos do código.'); return; }
    try {
      setVerifying(true);
      const res = await fetch(`${N8N_BASE}/webhook/check-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentPhoneE164, code })
      });
      let approved = false; let status = 'unknown'; let serverText = '';
      try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) { const j = await res.json(); approved = !!j.approved; status = j.status || status; }
        else { const t = await res.text(); serverText = t; approved = res.ok; status = res.ok ? 'ok' : (t || 'erro'); }
      } catch { /* noop */ }
      if (!approved) {
        let msg = 'Código inválido. Tente novamente.';
        if (status === 'expired') msg = 'Código expirado. Clique em Reenviar.';
        if (status === 'blocked') msg = 'Muitas tentativas. Aguarde e solicite um novo código.';
        if (!res.ok && serverText) { msg += ` (servidor: ${serverText.slice(0, 160)})`; }
        setMsgCode(msg);
        toast.error(msg);
        return;
      }
      // Approved -> persist changes now
      await persistChanges();
    } catch (e) {
      console.error('Erro na verificação OTP:', e);
      setMsgCode('Falha na verificação. Tente novamente.');
      toast.error('Falha na verificação.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!currentPhoneE164 || resendLeft > 0) return;
    try {
      setSendingCode(true);
      const res = await fetch(`${N8N_BASE}/webhook/start-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: currentPhoneE164, resend: true })
      });
      let ok = res.ok; try {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) { const j = await res.json(); ok = j.ok !== false; } else { await res.text(); }
      } catch { /* noop */ }
      if (!ok) throw new Error('Falha ao reenviar');
      startCooldown(60);
      setMsgCode('Novo código enviado.');
      toast.success('Novo código enviado.');
    } catch (e) {
      console.error('Erro ao reenviar OTP:', e);
      setMsgCode('Não foi possível reenviar agora.');
      toast.error('Falha ao reenviar.');
    } finally { setSendingCode(false); }
  };

  // Validação simples Cidade/UF
  const validateLoja = (s) => {
    if (!s) return false;
    const parts = String(s).split('/');
    if (parts.length !== 2) return false;
    const cidade = parts[0].trim();
    const uf = parts[1].trim();
    if (!cidade || cidade.length < 2) return false;
    if (!/^[A-Za-zÀ-ÿ0-9' .-]{2,}$/.test(cidade)) return false;
    if (!/^[A-Za-z]{2}$/.test(uf)) return false;
    return true;
  };

  // Removido botão próprio de CNPJ; será salvo junto com as demais alterações

  if (!user) return null;

  return (
    <Container>
      <Card>
        <Header>
          <FiEdit3 /> Meu Perfil
        </Header>
        <Content>
          {otpStep === 'form' && (
            <>
              <Grid>
                <FormGroup>
                  <Label>Nome Completo</Label>
                  <InputWrap>
                    <InputIcon><FiUser /></InputIcon>
                    <Input
                      type="text"
                      value={form.nome}
                      onChange={(e) => setForm(f => ({ ...f, nome: e.target.value }))}
                      placeholder="Seu nome completo"
                    />
                  </InputWrap>
                </FormGroup>
                <FormGroup>
                  <Label>CPF/CNPJ</Label>
                  <InputWrap>
                    <InputIcon><FiUser /></InputIcon>
                    <Input type="text" value={form.cpf_cnpj} disabled />
                  </InputWrap>
                </FormGroup>
              </Grid>

              <Grid>
                <FormGroup>
                  <Label>Telefone (WhatsApp)</Label>
                  <InputWrap>
                    <InputIcon><FiPhone /></InputIcon>
                    <Input
                      type="tel"
                      value={form.telefone}
                      onChange={(e) => setForm(f => ({ ...f, telefone: formatBRMask(e.target.value) }))}
                      placeholder="+55 (DDD) 9XXXX-XXXX"
                    />
                  </InputWrap>
                  {msg && <AlertErr>{msg}</AlertErr>}
                </FormGroup>
                <FormGroup>
                  <Label>Email</Label>
                  <InputWrap>
                    <InputIcon><FiMail /></InputIcon>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="Seu e-mail (opcional)"
                    />
                  </InputWrap>
                </FormGroup>
              </Grid>

              {user?.role === 'gerente' && (
                <Grid>
                  <FormGroup style={{ gridColumn: '1 / -1' }}>
                    <Label>Loja (Cidade/UF) - obrigatório para gerente</Label>
                    <InputWrap>
                      <InputIcon><FiMapPin /></InputIcon>
                      <Input
                        type="text"
                        value={lojaNome}
                        onChange={(e) => {
                          // manter UF em maiúsculas se existir '/'
                          const val = e.target.value;
                          const parts = val.split('/');
                          if (parts.length === 2) {
                            setLojaNome(parts[0] + '/' + parts[1].toUpperCase());
                          } else {
                            setLojaNome(val);
                          }
                        }}
                        placeholder="Cidade/UF (ex: Campo Grande/RJ)"
                      />
                    </InputWrap>
                    <Helper>Exemplo: Campo Grande/RJ. Use a sigla do estado com 2 letras.</Helper>
                  </FormGroup>
                </Grid>
              )}

              {/* CNPJ opcional: sempre mostrar; permitir editar */}
              <Grid>
                <FormGroup style={{ gridColumn: '1 / -1' }}>
                  <Label>CNPJ (opcional)</Label>
                  <InputWrap>
                    <InputIcon><FiUser /></InputIcon>
                    <Input
                      type="text"
                      value={cnpjOpcional}
                      onChange={(e) => {
                        if (!editingCnpj && user?.cnpj_opcional) return; // bloquear edição até clicar em editar
                        setCnpjOpcional(formatCnpj(e.target.value));
                      }}
                      disabled={savingCnpj || (!editingCnpj && !!user?.cnpj_opcional)}
                      placeholder="00.000.000/0000-00"
                    />
                  </InputWrap>
                  <Helper>
                    {user?.cnpj_opcional ? (
                      editingCnpj ? 'Edite o CNPJ e clique em Salvar para atualizar.' : `CNPJ cadastrado: ${formatCnpj(user.cnpj_opcional)}. Clique em "Editar CNPJ" se precisar alterar.`
                    ) : 'Se suas compras são faturadas no CNPJ da empresa, cadastre aqui para garantir a pontuação correta.'}
                  </Helper>
                  {user?.cnpj_opcional && (
                    <Button type="button" disabled={savingCnpj} style={{ marginTop: '0.5rem', background: editingCnpj ? '#6c757d' : '#A91918' }} onClick={() => {
                      if (editingCnpj) {
                        // Cancelar edição -> restaurar valor original formatado
                        const existing = getUserCnpj(user);
                        setCnpjOpcional(existing ? formatCnpj(existing) : '');
                        setEditingCnpj(false);
                      } else {
                        setEditingCnpj(true);
                      }
                    }}>
                      {editingCnpj ? 'Cancelar edição' : 'Editar CNPJ'}
                    </Button>
                  )}
                </FormGroup>
              </Grid>

              <ButtonRow>
                <Button onClick={handleSave} disabled={saving || sendingCode || savingCnpj}>
                  {saving ? <Spinner /> : <FiSave />} {saving ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </ButtonRow>

              <Helper style={{ marginTop: '6px' }}>
                Se alterar o número, será necessário validar via WhatsApp.
              </Helper>
            </>
          )}

          {otpStep === 'otp' && (
            <>
              <Helper>
                Enviamos um código para <b>{currentPhoneE164}</b>.
                <br />
                <button type="button" onClick={() => { setOtpStep('form'); setMsg(''); setMsgCode(''); }} style={{ background: 'none', border: 'none', color: '#A91918', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
                  <FiArrowLeft style={{ verticalAlign: 'middle' }} /> editar número
                </button>
              </Helper>

              <OtpRow>
                {otpDigits.map((d, i) => (
                  <OtpInput
                    key={i}
                    maxLength={1}
                    inputMode="numeric"
                    value={d}
                    onChange={async (e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 1);
                      const arr = [...otpDigits]; arr[i] = v; setOtpDigits(arr);
                      if (v && i < 5) {
                        const inputs = e.currentTarget.parentElement.querySelectorAll('input');
                        inputs[i + 1] && inputs[i + 1].focus();
                      }
                      const joined = arr.join('');
                      if (joined.length === 6) {
                        await handleVerify();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpDigits[i] && i > 0) {
                        const inputs = e.currentTarget.parentElement.querySelectorAll('input');
                        inputs[i - 1] && inputs[i - 1].focus();
                      }
                    }}
                  />
                ))}
              </OtpRow>

              <ButtonRow>
                <Button onClick={handleVerify} disabled={verifying}>
                  {verifying ? <Spinner /> : <FiCheck />} {verifying ? 'Validando...' : 'Validar código'}
                </Button>
                <SecondaryButton type="button" onClick={handleResend} disabled={sendingCode || resendLeft > 0}>
                  <FiRefreshCw /> Reenviar {resendLeft > 0 ? `(${resendLeft}s)` : ''}
                </SecondaryButton>
              </ButtonRow>

              {msgCode && (
                msgCode.toLowerCase().includes('código enviado') || msgCode.toLowerCase().includes('novo código')
                  ? <AlertOk>{msgCode}</AlertOk>
                  : <AlertErr>{msgCode}</AlertErr>
              )}
            </>
          )}
        </Content>
      </Card>
    </Container>
  );
}
