import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import {
    FiSettings,
    FiDollarSign,
    FiPercent,
    FiPlus,
    FiEdit3,
    FiTrash2,
    FiSave,
    FiX,
    FiCalendar,
    FiTarget,
    FiInfo
} from 'react-icons/fi';
import { supabase } from '../services/supabase';

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

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Section = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  padding: 2rem;
  box-shadow: ${props => props.theme.shadows.md};
  animation: ${fadeInUp} 0.6s ease-out;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  h2 {
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  background: ${props => {
        if (props.$variant === 'danger') return props.theme.colors.danger;
        if (props.$variant === 'success') return props.theme.colors.success;
        if (props.$variant === 'secondary') return props.theme.colors.gray300;
        return props.theme.colors.gradientPrimary;
    }};
  color: ${props => props.$variant === 'secondary' ? props.theme.colors.text : 'white'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.md};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const Card = styled.div`
  background: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radii.md};
  padding: 1.5rem;
  border: 2px solid ${props => props.$isEditing ? props.theme.colors.primary : 'transparent'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.lg};
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.colors.gray300};
  border-radius: ${props => props.theme.radii.md};
  font-size: 1rem;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.colors.gray300};
  border-radius: ${props => props.theme.radii.md};
  font-size: 1rem;
  background: white;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 2px solid ${props => props.theme.colors.gray300};
  border-radius: ${props => props.theme.radii.md};
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  border-radius: ${props => props.theme.radii.md};
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #1565c0;
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: ${props => props.theme.radii.lg};
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: ${fadeInUp} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  
  h3 {
    color: ${props => props.theme.colors.primary};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

function AdminConfiguracoes() {
    const [pontuacaoRules, setPontuacaoRules] = useState([]);
    const [promocoes, setPromocoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingRule, setEditingRule] = useState(null);
    const [editingPromocao, setEditingPromocao] = useState(null);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [showPromocaoModal, setShowPromocaoModal] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // Carregar regras de pontuação
            const { data: rules, error: rulesError } = await supabase
                .from('regras_pontuacao')
                .select('*')
                .order('created_at', { ascending: false });

            if (rulesError) throw rulesError;
            setPontuacaoRules(rules || []);

            // Carregar promoções
            const { data: promo, error: promoError } = await supabase
                .from('promocoes')
                .select('*')
                .order('data_inicio', { ascending: false });

            if (promoError) throw promoError;
            setPromocoes(promo || []);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            alert('Erro ao carregar dados: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRule = async (e) => {
        e.preventDefault();
        try {
            const ruleData = {
                nome: formData.nome,
                pontos_por_real: parseFloat(formData.pontos_por_real),
                descricao: formData.descricao,
                ativo: formData.ativo !== false
            };

            if (editingRule) {
                const { error } = await supabase
                    .from('regras_pontuacao')
                    .update(ruleData)
                    .eq('id', editingRule.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('regras_pontuacao')
                    .insert([ruleData]);

                if (error) throw error;
            }

            setShowRuleModal(false);
            setEditingRule(null);
            setFormData({});
            loadData();
        } catch (error) {
            console.error('Erro ao salvar regra:', error);
            alert('Erro ao salvar regra: ' + error.message);
        }
    };

    const handleSavePromocao = async (e) => {
        e.preventDefault();
        try {
            const promocaoData = {
                nome: formData.nome,
                descricao: formData.descricao,
                multiplicador_pontos: parseFloat(formData.multiplicador_pontos || 1),
                data_inicio: formData.data_inicio,
                data_fim: formData.data_fim,
                ativo: formData.ativo !== false
            };

            if (editingPromocao) {
                const { error } = await supabase
                    .from('promocoes')
                    .update(promocaoData)
                    .eq('id', editingPromocao.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('promocoes')
                    .insert([promocaoData]);

                if (error) throw error;
            }

            setShowPromocaoModal(false);
            setEditingPromocao(null);
            setFormData({});
            loadData();
        } catch (error) {
            console.error('Erro ao salvar promoção:', error);
            alert('Erro ao salvar promoção: ' + error.message);
        }
    };

    const handleDeleteRule = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta regra?')) return;

        try {
            const { error } = await supabase
                .from('regras_pontuacao')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadData();
        } catch (error) {
            console.error('Erro ao excluir regra:', error);
            alert('Erro ao excluir regra: ' + error.message);
        }
    };

    const handleDeletePromocao = async (id) => {
        if (!confirm('Tem certeza que deseja excluir esta promoção?')) return;

        try {
            const { error } = await supabase
                .from('promocoes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadData();
        } catch (error) {
            console.error('Erro ao excluir promoção:', error);
            alert('Erro ao excluir promoção: ' + error.message);
        }
    };

    const openRuleModal = (rule = null) => {
        setEditingRule(rule);
        setFormData(rule ? { ...rule } : {});
        setShowRuleModal(true);
    };

    const openPromocaoModal = (promocao = null) => {
        setEditingPromocao(promocao);
        setFormData(promocao ? {
            ...promocao,
            data_inicio: promocao.data_inicio?.split('T')[0],
            data_fim: promocao.data_fim?.split('T')[0]
        } : {});
        setShowPromocaoModal(true);
    };

    if (loading) {
        return (
            <Container>
                <Section>
                    <p>Carregando configurações...</p>
                </Section>
            </Container>
        );
    }

    return (
        <Container>
            {/* Regras de Pontuação */}
            <Section>
                <SectionHeader>
                    <h2>
                        <FiDollarSign />
                        Regras de Pontuação
                    </h2>
                    <Button onClick={() => openRuleModal()}>
                        <FiPlus />
                        Nova Regra
                    </Button>
                </SectionHeader>

                <InfoCard>
                    <FiInfo size={24} />
                    <div>
                        <strong>Defina quantos pontos os clientes ganham por real gasto.</strong>
                        <br />
                        Exemplo: 1 ponto por R$ 1,00 gasto, ou 2 pontos por R$ 1,00 em promoções.
                    </div>
                </InfoCard>

                <Grid>
                    {pontuacaoRules.map(rule => (
                        <Card key={rule.id}>
                            <h3>{rule.nome}</h3>
                            <p><strong>Pontos por Real:</strong> {rule.pontos_por_real}</p>
                            <p><strong>Descrição:</strong> {rule.descricao}</p>
                            <p><strong>Status:</strong> {rule.ativo ? 'Ativo' : 'Inativo'}</p>

                            <ButtonGroup>
                                <Button
                                    $variant="secondary"
                                    onClick={() => openRuleModal(rule)}
                                >
                                    <FiEdit3 />
                                    Editar
                                </Button>
                                <Button
                                    $variant="danger"
                                    onClick={() => handleDeleteRule(rule.id)}
                                >
                                    <FiTrash2 />
                                    Excluir
                                </Button>
                            </ButtonGroup>
                        </Card>
                    ))}

                    {pontuacaoRules.length === 0 && (
                        <Card>
                            <p>Nenhuma regra de pontuação cadastrada.</p>
                        </Card>
                    )}
                </Grid>
            </Section>

            {/* Promoções */}
            <Section>
                <SectionHeader>
                    <h2>
                        <FiPercent />
                        Promoções
                    </h2>
                    <Button onClick={() => openPromocaoModal()}>
                        <FiPlus />
                        Nova Promoção
                    </Button>
                </SectionHeader>

                <InfoCard>
                    <FiInfo size={24} />
                    <div>
                        <strong>Crie promoções com multiplicadores de pontos e validade.</strong>
                        <br />
                        Exemplo: "Dobro de pontos" com multiplicador 2x durante um período específico.
                    </div>
                </InfoCard>

                <Grid>
                    {promocoes.map(promocao => (
                        <Card key={promocao.id}>
                            <h3>{promocao.nome}</h3>
                            <p><strong>Multiplicador:</strong> {promocao.multiplicador_pontos}x</p>
                            <p><strong>Período:</strong> {new Date(promocao.data_inicio).toLocaleDateString()} até {new Date(promocao.data_fim).toLocaleDateString()}</p>
                            <p><strong>Descrição:</strong> {promocao.descricao}</p>
                            <p><strong>Status:</strong> {promocao.ativo ? 'Ativo' : 'Inativo'}</p>

                            <ButtonGroup>
                                <Button
                                    $variant="secondary"
                                    onClick={() => openPromocaoModal(promocao)}
                                >
                                    <FiEdit3 />
                                    Editar
                                </Button>
                                <Button
                                    $variant="danger"
                                    onClick={() => handleDeletePromocao(promocao.id)}
                                >
                                    <FiTrash2 />
                                    Excluir
                                </Button>
                            </ButtonGroup>
                        </Card>
                    ))}

                    {promocoes.length === 0 && (
                        <Card>
                            <p>Nenhuma promoção cadastrada.</p>
                        </Card>
                    )}
                </Grid>
            </Section>

            {/* Modal Regra de Pontuação */}
            {showRuleModal && (
                <Modal onClick={(e) => e.target === e.currentTarget && setShowRuleModal(false)}>
                    <ModalContent>
                        <ModalHeader>
                            <h3>
                                <FiDollarSign />
                                {editingRule ? 'Editar Regra' : 'Nova Regra'}
                            </h3>
                            <Button
                                $variant="secondary"
                                onClick={() => setShowRuleModal(false)}
                            >
                                <FiX />
                            </Button>
                        </ModalHeader>

                        <form onSubmit={handleSaveRule}>
                            <FormGroup>
                                <Label>Nome da Regra</Label>
                                <Input
                                    type="text"
                                    value={formData.nome || ''}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                    placeholder="Ex: Pontuação Padrão"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Pontos por Real (R$)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.pontos_por_real || ''}
                                    onChange={(e) => setFormData({ ...formData, pontos_por_real: e.target.value })}
                                    required
                                    placeholder="Ex: 1.0"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Descrição</Label>
                                <TextArea
                                    value={formData.descricao || ''}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    placeholder="Descreva quando esta regra se aplica..."
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>
                                    <input
                                        type="checkbox"
                                        checked={formData.ativo !== false}
                                        onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                                    />
                                    Regra Ativa
                                </Label>
                            </FormGroup>

                            <ButtonGroup>
                                <Button type="submit">
                                    <FiSave />
                                    Salvar
                                </Button>
                                <Button
                                    type="button"
                                    $variant="secondary"
                                    onClick={() => setShowRuleModal(false)}
                                >
                                    Cancelar
                                </Button>
                            </ButtonGroup>
                        </form>
                    </ModalContent>
                </Modal>
            )}

            {/* Modal Promoção */}
            {showPromocaoModal && (
                <Modal onClick={(e) => e.target === e.currentTarget && setShowPromocaoModal(false)}>
                    <ModalContent>
                        <ModalHeader>
                            <h3>
                                <FiPercent />
                                {editingPromocao ? 'Editar Promoção' : 'Nova Promoção'}
                            </h3>
                            <Button
                                $variant="secondary"
                                onClick={() => setShowPromocaoModal(false)}
                            >
                                <FiX />
                            </Button>
                        </ModalHeader>

                        <form onSubmit={handleSavePromocao}>
                            <FormGroup>
                                <Label>Nome da Promoção</Label>
                                <Input
                                    type="text"
                                    value={formData.nome || ''}
                                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                    required
                                    placeholder="Ex: Dobro de Pontos"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Multiplicador de Pontos</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    value={formData.multiplicador_pontos || ''}
                                    onChange={(e) => setFormData({ ...formData, multiplicador_pontos: e.target.value })}
                                    required
                                    placeholder="Ex: 2.0 (dobro)"
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Data de Início</Label>
                                <Input
                                    type="date"
                                    value={formData.data_inicio || ''}
                                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Data de Fim</Label>
                                <Input
                                    type="date"
                                    value={formData.data_fim || ''}
                                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                                    required
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>Descrição</Label>
                                <TextArea
                                    value={formData.descricao || ''}
                                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                    placeholder="Descreva os detalhes da promoção..."
                                />
                            </FormGroup>

                            <FormGroup>
                                <Label>
                                    <input
                                        type="checkbox"
                                        checked={formData.ativo !== false}
                                        onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                                    />
                                    Promoção Ativa
                                </Label>
                            </FormGroup>

                            <ButtonGroup>
                                <Button type="submit">
                                    <FiSave />
                                    Salvar
                                </Button>
                                <Button
                                    type="button"
                                    $variant="secondary"
                                    onClick={() => setShowPromocaoModal(false)}
                                >
                                    Cancelar
                                </Button>
                            </ButtonGroup>
                        </form>
                    </ModalContent>
                </Modal>
            )}
        </Container>
    );
}

export default AdminConfiguracoes;
