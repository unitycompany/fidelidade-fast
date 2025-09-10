# Configuração de chaves de API para o servidor Python (EXEMPLO)
# Copie este arquivo para config.py e preencha com suas chaves reais

import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

# Configurações de API
API_KEYS = {
    "deepseek": os.getenv("VITE_DEEPSEEK_API_KEY") or "sua_chave_deepseek_aqui",
    "gemini": os.getenv("VITE_GEMINI_API_KEY") or "sua_chave_gemini_aqui",
    "openai": os.getenv("VITE_OPENAI_API_KEY") or "",
    "anthropic": os.getenv("VITE_ANTHROPIC_API_KEY") or ""
}

# Configurações do Supabase
SUPABASE_CONFIG = {
    "url": os.getenv("VITE_SUPABASE_URL") or "sua_url_supabase_aqui",
    "anon_key": os.getenv("VITE_SUPABASE_ANON_KEY") or "sua_chave_anonima_supabase_aqui"
}

# Configuração de segurança para API
API_SECURITY = {
    "api_key": os.getenv("FLASK_API_KEY", ""),  # Chave para autenticar requisições ao servidor Flask
    "allowed_origins": os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
}

# Função para obter chaves de API
def get_api_key(service):
    """
    Obtém a chave de API para o serviço especificado
    
    Args:
        service: Nome do serviço (deepseek, gemini, openai, anthropic)
        
    Returns:
        str: Chave de API do serviço
    """
    return API_KEYS.get(service, "")

# Função para obter configurações do Supabase
def get_supabase_config():
    """
    Obtém as configurações do Supabase
    
    Returns:
        dict: Configurações do Supabase (url, anon_key)
    """
    return SUPABASE_CONFIG
