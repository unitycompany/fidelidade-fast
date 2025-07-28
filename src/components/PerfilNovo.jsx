import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit3, FiSave, FiX, FiLoader, FiCamera, FiStar, FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi'
import { supabase } from '../services/supabase'
import { useAuth } from '../App'

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  background: #f8fafc;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  animation: ${fadeIn} 0.6s ease-out;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

// Card principal do perfil
const ProfileCard = styled.div`
  background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.8);
  height: fit-content;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
`;

const AvatarContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #cc1515, #a70d0d)'};
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  font-family: 'Urbanist', sans-serif;
  box-shadow: 0 8px 24px rgba(204, 21, 21, 0.3);
  border: 4px solid white;
  position: relative;
  overflow: hidden;
`;

const AvatarUpload = styled.label`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.3);
  
  &:hover {
    background: #0056b3;
    transform: scale(1.1);
  }
  
  input {
    display: none;
  }
`;

const ProfileName = styled.h1`
  font-size: 1.8rem;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
  font-family: 'Urbanist', sans-serif;
  font-weight: 700;
  text-align: center;
`;

const ProfileEmail = styled.p`
  color: #718096;
  font-size: 1rem;
  margin: 0 0 1rem 0;
  text-align: center;
`;

// Estatísticas do usuário
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin: 1.5rem 0;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, ${props => props.color || '#667eea'}, ${props => props.colorEnd || '#764ba2'});
  color: white;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  
  .value {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }
  
  .label {
    font-size: 0.8rem;
    opacity: 0.9;
  }
`;

// Card de informações detalhadas
const InfoCard = styled.div`
  background: linear-gradient(145deg, #ffffff 0%, #fafbfc 100%);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.8);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  color: #2d3748;
  margin: 0 0 1.5rem 0;
  font-family: 'Urbanist', sans-serif;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoSection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 1rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InfoItem = styled.div`
  background: #f7fafc;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid ${props => props.color || '#cc1515'};
  
  .label {
    font-size: 0.8rem;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }
  
  .value {
    font-size: 1rem;
    color: #2d3748;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const EditButton = styled.button`
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem auto 0;
  font-family: 'Urbanist', sans-serif;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 123, 255, 0.4);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

// Modal de edição
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
  border-radius: 16px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2d3748;
  font-family: 'Urbanist', sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Urbanist', sans-serif;
  
  &:focus {
    outline: none;
    border-color: #cc1515;
    box-shadow: 0 0 0 3px rgba(204, 21, 21, 0.1);
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #666;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: #718096;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Urbanist', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  ${props => props.variant === 'primary' ? `
    background: linear-gradient(135deg, #cc1515, #a70d0d);
    color: white;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(204, 21, 21, 0.3);
    }
  ` : `
    background: #e2e8f0;
    color: #4a5568;
    
    &:hover {
      background: #cbd5e0;
    }
  `}
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

function Perfil() {
  const { user, updateUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    imagem_perfil: ''
  })
  const [stats, setStats] = useState({
    saldoAtual: 0,
    totalGanhos: 0,
    totalGastos: 0,
    pedidosAnalisados: 0,
    dataUltimoLogin: null,
    dataCadastro: null,
    validadePontos: null
  })

  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        endereco: user.endereco || '',
        cidade: user.cidade || '',
        estado: user.estado || '',
        cep: user.cep || '',
        imagem_perfil: user.imagem_perfil || ''
      })
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      // Buscar dados completos do cliente
      const { data: cliente, error } = await supabase
        .from('clientes_fast')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      // Contar pedidos analisados
      const { count } = await supabase
        .from('pedidos_fast')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', user.id)

      // Calcular validade dos pontos (1 ano após a data de cadastro dos pontos)
      const validadePontos = new Date()
      validadePontos.setFullYear(validadePontos.getFullYear() + 1)

      setStats({
        saldoAtual: cliente.saldo_pontos || 0,
        totalGanhos: cliente.total_pontos_ganhos || 0,
        totalGastos: cliente.total_pontos_gastos || 0,
        pedidosAnalisados: count || 0,
        dataUltimoLogin: cliente.ultimo_login ? new Date(cliente.ultimo_login) : null,
        dataCadastro: cliente.created_at ? new Date(cliente.created_at) : null,
        validadePontos
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tamanho (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.')
      return
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Arquivo deve ser uma imagem.')
      return
    }

    try {
      setUploadingImage(true)

      // Converter para base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64 = reader.result

        // Salvar no banco
        const { error } = await supabase
          .from('clientes_fast')
          .update({ imagem_perfil: base64 })
          .eq('id', user.id)

        if (error) throw error

        setFormData(prev => ({ ...prev, imagem_perfil: base64 }))
        updateUser({ ...user, imagem_perfil: base64 })
        toast.success('Imagem atualizada com sucesso!')
      }
      reader.readAsDataURL(file)

    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      toast.error('Erro ao atualizar imagem')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('clientes_fast')
        .update({
          nome: formData.nome,
          telefone: formData.telefone,
          endereco: formData.endereco,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep
        })
        .eq('id', user.id)

      if (error) throw error

      // Atualizar contexto do usuário
      updateUser({
        ...user,
        nome: formData.nome,
        telefone: formData.telefone,
        endereco: formData.endereco,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep
      })

      toast.success('Perfil atualizado com sucesso!')
      setIsEditing(false)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      toast.error('Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const formatDate = (date) => {
    if (!date) return 'Não informado'
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  if (!user) {
    return (
      <Container>
        <Content>
          <ProfileCard>
            <p>Carregando perfil...</p>
          </ProfileCard>
        </Content>
      </Container>
    )
  }

  return (
    <Container>
      <Content>
        {/* Card do Perfil */}
        <ProfileCard>
          <AvatarSection>
            <AvatarContainer>
              <Avatar imageUrl={formData.imagem_perfil}>
                {!formData.imagem_perfil && getInitials(formData.nome)}
              </Avatar>
              <AvatarUpload>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage ? <FiLoader className="animate-spin" /> : <FiCamera />}
              </AvatarUpload>
            </AvatarContainer>
            <ProfileName>{formData.nome}</ProfileName>
            <ProfileEmail>{formData.email}</ProfileEmail>
          </AvatarSection>

          <StatsGrid>
            <StatCard color="#38a169" colorEnd="#2f855a">
              <div className="value">{stats.saldoAtual.toLocaleString()}</div>
              <div className="label">Pontos Disponíveis</div>
            </StatCard>
            <StatCard color="#3182ce" colorEnd="#2c5282">
              <div className="value">{stats.totalGanhos.toLocaleString()}</div>
              <div className="label">Total Ganho</div>
            </StatCard>
            <StatCard color="#d69e2e" colorEnd="#b7791f">
              <div className="value">{stats.totalGastos.toLocaleString()}</div>
              <div className="label">Total Gasto</div>
            </StatCard>
            <StatCard color="#805ad5" colorEnd="#6b46c1">
              <div className="value">{stats.pedidosAnalisados}</div>
              <div className="label">Notas Enviadas</div>
            </StatCard>
          </StatsGrid>

          <EditButton onClick={() => setIsEditing(true)}>
            <FiEdit3 />
            Editar Perfil
          </EditButton>
        </ProfileCard>

        {/* Card de Informações */}
        <InfoCard>
          <InfoSection>
            <SectionTitle>
              <FiUser />
              Informações Pessoais
            </SectionTitle>
            <InfoGrid>
              <InfoItem color="#cc1515">
                <div className="label">Nome Completo</div>
                <div className="value">{formData.nome || 'Não informado'}</div>
              </InfoItem>
              <InfoItem color="#007bff">
                <div className="label">E-mail</div>
                <div className="value">
                  <FiMail />
                  {formData.email || 'Não informado'}
                </div>
              </InfoItem>
              <InfoItem color="#28a745">
                <div className="label">Telefone</div>
                <div className="value">
                  <FiPhone />
                  {formData.telefone || 'Não informado'}
                </div>
              </InfoItem>
              <InfoItem color="#fd7e14">
                <div className="label">Endereço</div>
                <div className="value">
                  <FiMapPin />
                  {formData.endereco || 'Não informado'}
                </div>
              </InfoItem>
            </InfoGrid>
          </InfoSection>

          <InfoSection>
            <SectionTitle>
              <FiStar />
              Programa de Fidelidade
            </SectionTitle>
            <InfoGrid>
              <InfoItem color="#38a169">
                <div className="label">Validade dos Pontos</div>
                <div className="value">
                  <FiClock />
                  {formatDate(stats.validadePontos)}
                </div>
              </InfoItem>
              <InfoItem color="#3182ce">
                <div className="label">Membro desde</div>
                <div className="value">
                  <FiCalendar />
                  {formatDate(stats.dataCadastro)}
                </div>
              </InfoItem>
              <InfoItem color="#d69e2e">
                <div className="label">Último acesso</div>
                <div className="value">
                  <FiClock />
                  {formatDate(stats.dataUltimoLogin)}
                </div>
              </InfoItem>
              <InfoItem color="#805ad5">
                <div className="label">Status</div>
                <div className="value">
                  <FiTrendingUp />
                  Cliente Ativo
                </div>
              </InfoItem>
            </InfoGrid>
          </InfoSection>
        </InfoCard>
      </Content>

      {/* Modal de Edição */}
      {isEditing && (
        <Modal onClick={(e) => e.target === e.currentTarget && setIsEditing(false)}>
          <ModalContent>
            <SectionTitle>
              <FiEdit3 />
              Editar Perfil
            </SectionTitle>

            <FormGroup>
              <Label>Nome Completo</Label>
              <Input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
              />
            </FormGroup>

            <FormGroup>
              <Label>Telefone</Label>
              <Input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
              />
            </FormGroup>

            <FormGroup>
              <Label>Endereço</Label>
              <Input
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleInputChange}
                placeholder="Rua, número, complemento"
              />
            </FormGroup>

            <InfoGrid>
              <FormGroup>
                <Label>Cidade</Label>
                <Input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  placeholder="Sua cidade"
                />
              </FormGroup>

              <FormGroup>
                <Label>Estado</Label>
                <Input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  placeholder="RJ"
                />
              </FormGroup>
            </InfoGrid>

            <FormGroup>
              <Label>CEP</Label>
              <Input
                type="text"
                name="cep"
                value={formData.cep}
                onChange={handleInputChange}
                placeholder="00000-000"
              />
            </FormGroup>

            <ButtonGroup>
              <Button onClick={() => setIsEditing(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={loading}>
                {loading ? <FiLoader className="animate-spin" /> : <FiSave />}
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  )
}

export default Perfil
