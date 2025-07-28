@echo off
echo =====================================
echo FAST SISTEMAS - INICIO INTELIGENTE
echo =====================================
echo.

cd /d "%~dp0"

echo [1/3] Ativando ambiente virtual...
if not exist "venv\Scripts\activate.bat" (
    echo ERRO: Ambiente virtual nao encontrado.
    echo Execute primeiro: Install-Robust.ps1 ou setup_robust.bat
    pause
    exit /b 1
)

call venv\Scripts\activate.bat

echo [2/3] Verificando dependencias disponiveis...

python -c "import cv2, pytesseract, PIL; print('completo')" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Todas as dependencias OK - Usando sistema COMPLETO
    echo [3/3] Iniciando servidor completo...
    echo.
    echo 🚀 Servidor completo em http://localhost:5001
    echo 💡 Recursos: OCR real + Reconhecimento inteligente
    echo.
    python app_complete.py
    goto :end
)

python -c "import PIL; print('basico')" >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️ Dependencias parciais - Usando sistema BASICO
    echo [3/3] Iniciando servidor basico...
    echo.
    echo 🚀 Servidor básico em http://localhost:5001  
    echo 💡 Recursos: Processamento simulado + Reconhecimento
    echo.
    python app_fallback.py
    goto :end
)

echo ❌ Dependencias insuficientes - Usando sistema MINIMO
echo [3/3] Iniciando servidor minimo...
echo.
echo 🚀 Servidor mínimo em http://localhost:5001
echo 💡 Recursos: Simulação completa
echo.
python app_simple.py

:end
echo.
echo Para parar o servidor: Ctrl+C
