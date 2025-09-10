import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FiUpload, FiX, FiCheck, FiLoader, FiImage, FiFile } from 'react-icons/fi';
import imagemNotaFiscalService from '../services/imagemNotaFiscalService';
import toast from 'react-hot-toast';

const UploadContainer = styled.div`
  border: 2px dashed #E2E8F0;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #cc1515;
    background: #FFF5F5;
  }
  
  &.dragover {
    border-color: #cc1515;
    background: #FFF5F5;
  }
`;

const UploadIcon = styled.div`
  font-size: 3rem;
  color: #A0AEC0;
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  color: #4A5568;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  color: #718096;
  font-size: 0.875rem;
`;

const FileList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: #F7FAFC;
  border: 1px solid #E2E8F0;
  border-radius: 0.25rem;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #2D3748;
`;

const FileSize = styled.div`
  color: #718096;
  font-size: 0.875rem;
`;

const FileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  
  &.success {
    background: #10B981;
    color: white;
  }
  
  &.error {
    background: #EF4444;
    color: white;
  }
  
  &.loading {
    background: #F59E0B;
    color: white;
  }
`;

const RemoveButton = styled.button`
  background: #EF4444;
  color: white;
  border: none;
  padding: 0.25rem;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #DC2626;
  }
`;

function UploadImagemNota({ clienteId, pedidoId = null, onUploadComplete, maxFiles = 5 }) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (selectedFiles) => {
        const fileArray = Array.from(selectedFiles);

        // Verificar limite de arquivos
        if (files.length + fileArray.length > maxFiles) {
            toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
            return;
        }

        // Adicionar arquivos à lista com status inicial
        const newFiles = fileArray.map(file => ({
            file,
            id: Date.now() + Math.random(),
            status: 'pending', // pending, uploading, success, error
            progress: 0,
            error: null
        }));

        setFiles(prev => [...prev, ...newFiles]);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const droppedFiles = e.dataTransfer.files;
        handleFileSelect(droppedFiles);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const removeFile = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const uploadFile = async (fileData) => {
        try {
            // Atualizar status para uploading
            setFiles(prev => prev.map(f =>
                f.id === fileData.id
                    ? { ...f, status: 'uploading', progress: 0 }
                    : f
            ));

            const result = await imagemNotaFiscalService.uploadImagem(
                fileData.file,
                clienteId,
                pedidoId,
                {
                    // Metadados adicionais podem ser passados aqui
                }
            );

            if (result.success) {
                // Atualizar status para success
                setFiles(prev => prev.map(f =>
                    f.id === fileData.id
                        ? { ...f, status: 'success', progress: 100, data: result.data }
                        : f
                ));

                toast.success(`Arquivo ${fileData.file.name} enviado com sucesso!`);

                // Callback para o componente pai
                if (onUploadComplete) {
                    onUploadComplete(result.data);
                }
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            // Atualizar status para error
            setFiles(prev => prev.map(f =>
                f.id === fileData.id
                    ? { ...f, status: 'error', progress: 0, error: error.message }
                    : f
            ));

            toast.error(`Erro ao enviar ${fileData.file.name}: ${error.message}`);
        }
    };

    const uploadAllFiles = async () => {
        setUploading(true);

        const pendingFiles = files.filter(f => f.status === 'pending');

        // Upload sequencial para evitar sobrecarga
        for (const fileData of pendingFiles) {
            await uploadFile(fileData);
        }

        setUploading(false);
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const renderStatusIcon = (status) => {
        switch (status) {
            case 'success':
                return <StatusIcon className="success"><FiCheck size={12} /></StatusIcon>;
            case 'error':
                return <StatusIcon className="error"><FiX size={12} /></StatusIcon>;
            case 'uploading':
                return <StatusIcon className="loading"><FiLoader size={12} className="animate-spin" /></StatusIcon>;
            default:
                return null;
        }
    };

    return (
        <div>
            <UploadContainer
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
            >
                <UploadIcon>
                    <FiUpload />
                </UploadIcon>
                <UploadText>
                    Clique ou arraste arquivos aqui
                </UploadText>
                <UploadSubtext>
                    Suporte a imagens (JPG, PNG, WEBP) e PDF • Máximo 10MB por arquivo
                </UploadSubtext>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFileSelect(e.target.files)}
                />
            </UploadContainer>

            {files.length > 0 && (
                <FileList>
                    {files.map((fileData) => (
                        <FileItem key={fileData.id}>
                            <FileInfo>
                                {fileData.file.type.startsWith('image/') ? (
                                    <FiImage color="#3B82F6" />
                                ) : (
                                    <FiFile color="#6B7280" />
                                )}
                                <div>
                                    <FileName>{fileData.file.name}</FileName>
                                    <FileSize>{formatFileSize(fileData.file.size)}</FileSize>
                                </div>
                            </FileInfo>

                            <FileActions>
                                {renderStatusIcon(fileData.status)}
                                {fileData.status === 'pending' && (
                                    <RemoveButton onClick={() => removeFile(fileData.id)}>
                                        <FiX size={14} />
                                    </RemoveButton>
                                )}
                            </FileActions>
                        </FileItem>
                    ))}

                    {files.some(f => f.status === 'pending') && (
                        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <button
                                onClick={uploadAllFiles}
                                disabled={uploading}
                                style={{
                                    background: 'linear-gradient(135deg, #cc1515 0%, #9b0c0c 100%)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.25rem',
                                    fontWeight: '600',
                                    cursor: uploading ? 'not-allowed' : 'pointer',
                                    opacity: uploading ? 0.6 : 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    margin: '0 auto'
                                }}
                            >
                                {uploading ? (
                                    <>
                                        <FiLoader className="animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <FiUpload />
                                        Enviar Arquivos
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </FileList>
            )}
        </div>
    );
}

export default UploadImagemNota;
