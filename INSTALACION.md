# Instrucciones de Instalación

## ⚠️ Problema

El servidor no inicia porque faltan las dependencias npm. El error indica:
```
Error: Cannot find module 'exceljs'
```

## ✅ Solución (Limpieza Completa)

Ya se eliminaron `node_modules` y `package-lock.json`. Ahora ejecuta:

```bash
cd C:\Users\crist\OneDrive\Escritorio\sas-c4-bitacora

npm install
```

**⏱️ Esto puede tardar 2-3 minutos.**

### Si npm install falla todavía:

Intenta con cache limpio:
```bash
npm cache clean --force
npm install
```

## 🚀 Después de instalar

Una vez que npm install termine exitosamente, ejecuta:

```bash
cd backend
node server.js
```

Deberías ver:
```
==================================================
🚀 SAS C4 - Bitácora de Llamadas
==================================================
✅ Servidor: http://localhost:3000
```

## 📦 Dependencias que se instalarán

- **exceljs** - Exportación a Excel
- **pdfkit** - Generación de PDF
- **json2csv** - Exportación a CSV
- **socket.io** - WebSockets (notificaciones en tiempo real)
- **speakeasy** - 2FA
- **qrcode** - Códigos QR para 2FA
- **helmet** - Seguridad HTTP
- **rate-limiter-flexible** - Rate limiting
- **dayjs** - Manejo de fechas
- **lodash** - Utilidades
- **axios** - Cliente HTTP

## 🔧 Troubleshooting

### Si npm install se queda atascado:
1. Presiona `Ctrl+C` para cancelar
2. Limpia cache: `npm cache clean --force`
3. Intenta de nuevo: `npm install`

### Si hay conflictos de versiones:
```bash
npm install --legacy-peer-deps
```

### Si OneDrive causa problemas:
Mueve el proyecto fuera de OneDrive a una carpeta local como `C:\Proyectos\sas-c4-bitacora`
