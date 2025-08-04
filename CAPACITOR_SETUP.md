# Capacitor Setup - Transformar React em App Nativo

## 1. Instalar Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android @capacitor/ios
```

## 2. Inicializar Capacitor
```bash
npx cap init "Fast Fidelidade" "com.fast.fidelidade"
```

## 3. Configurar build
Adicionar no package.json:
```json
{
  "scripts": {
    "build:app": "npm run build && npx cap sync"
  }
}
```

## 4. Adicionar plataformas
```bash
npx cap add android
npx cap add ios
```

## 5. Abrir em IDE nativa
```bash
npx cap open android
npx cap open ios
```

## 6. Recursos nativos disponíveis:
- Câmera
- GPS/Localização  
- Push Notifications
- Contatos
- Calendário
- Armazenamento
- Compartilhamento
- In-App Purchase
- Biometria

## 7. Exemplo de uso da câmera:
```javascript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  
  return image.webPath;
};
```

## 8. Build para produção:
```bash
# Android
npm run build:app
npx cap open android
# No Android Studio: Build > Generate Signed Bundle/APK

# iOS  
npm run build:app
npx cap open ios
# No Xcode: Product > Archive
```
