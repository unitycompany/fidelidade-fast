import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import gifCarregando from '../assets/gif-carregando.gif'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const fadeOut = keyframes`
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
`

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: ${props => props.minHeight || '200px'};
  animation: ${props => props.isExiting ? fadeOut : fadeIn} 0.6s ease-in-out;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 1rem;
    min-height: ${props => props.minHeight || '150px'};
  }
`

const GifImage = styled.img`
  width: ${props => props.size || '450px'};
  height: auto;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    width: ${props => props.mobileSize || '350px'};
  }
  
  @media (max-width: 480px) {
    width: ${props => props.mobileSize || '280px'};
  }
`

const LoadingText = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme?.colors?.text || '#333'};
  margin: 0;
  text-align: center;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`

const LoadingGif = ({
    text = 'Carregando...',
    size = '450px',
    mobileSize = '350px',
    minHeight = '200px',
    minDuration = 3000, // 3 segundos - duração completa do GIF
    onComplete // Callback quando o loading terminar
}) => {
    const [isVisible, setIsVisible] = useState(true)
    const [isExiting, setIsExiting] = useState(false)
    const [gifKey, setGifKey] = useState(0) // Key para forçar re-render do GIF

    useEffect(() => {
        // Forçar o GIF a reiniciar do zero
        setGifKey(prev => prev + 1)

        // Garantir que o GIF rode pelo menos uma vez completa (3 segundos)
        const timer = setTimeout(() => {
            // Iniciar animação de saída
            setIsExiting(true)

            // Após a animação de saída, esconder o componente
            setTimeout(() => {
                setIsVisible(false)
                if (onComplete) {
                    onComplete()
                }
            }, 600) // Tempo da animação de saída
        }, minDuration)

        return () => clearTimeout(timer)
    }, [minDuration, onComplete])

    if (!isVisible) {
        return null
    }

    return (
        <LoadingContainer minHeight={minHeight} isExiting={isExiting}>
            <GifImage
                key={gifKey} // Força o GIF a reiniciar
                src={gifCarregando}
                alt="Carregando..."
                size={size}
                mobileSize={mobileSize}
            />
            <LoadingText>{text}</LoadingText>
        </LoadingContainer>
    )
}

export default LoadingGif
